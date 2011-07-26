describe("Call Method", function() {
  var object = {};
  var object_instance = new Object;
  var string = "blah blah blah";
  var array = [1,2,3];
  var function_literal = function() {};
  var function_instance = new Function();
  var native_function = "foo".replace;

  it("should exist on non-function objects", function() {
    var call = Object.prototype.call;
    expect(object.call).toEqual(call);
    expect(object_instance.call).toEqual(call);
    expect(string.call).toEqual(call);
    expect(array.call).toEqual(call);
  });
  
  it("should not override call method on functions", function() {
    var call = Function.prototype.call;
    expect(function_literal.call).toEqual(call);
    expect(function_instance.call).toEqual(call);
    expect(native_function.call).toEqual(call);
  });
  
  describe("when passed a non-function", function() {
    it("should cause a method missing error", function() {
      expect(function() { object.call(); }).toThrow();
      expect(function() { object.call(0); }).toThrow();
    });
  });
  
  describe("when passed a function", function() {    
    it("should run that function with the method's object as scope", function() {
      object.call(function() { expect(this).toEqual(object); });
    });
    
    it("should return the value returned from that function", function() {
      var value = {foo: 'bar'};
      expect(object.call(function() { return value; })).toEqual(value);
    });
    
    var args = [1, 2, 3];
    describe("and nothing else", function() {
      it("should not pass any parameters to the function", function() {
        object.call(function() { 
          expect(arguments.length).toEqual(0);
        });
      });
    });
    
    describe("and an extra parameter", function() {
      it("should pass the parameter to the function", function() {
        object.call(function() { 
          expect(arguments[0]).toEqual(args[0]); 
          expect(arguments.length).toEqual(1);
        }, args[0]);
      });
    });
      
    describe("and three extra parameters", function() {
      it("should pass all three parameters to the function", function() {
        object.call(function() { 
          expect(arguments[0]).toEqual(args[0]);
          expect(arguments[1]).toEqual(args[1]);
          expect(arguments[2]).toEqual(args[2]);
          expect(arguments.length).toEqual(3);
        }, args[0], args[1], args[2]);
      });
    });
  });
});