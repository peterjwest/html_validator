describe("Each Method", function() {
  var each = variables.each;

  describe("when not passed a function", function() {
    describe("when called on an non-empty object", function() {
      var object = {foo: 'bar', zim: 'gir'};
      it("should cause a method missing error", function() {
        expect(function() { object.call(each); }).toThrow();
        expect(function() { object.call(each, 0); }).toThrow();
      });
    });
  });
  
  describe("when passed a function", function() {
    describe("when called on an object", function() {
      it("should return an array", function() {
        var object = {};
        expect(object.call(each, function() { })).toEqual([]);
      });
    });
  
    describe("when called on an empty object", function() {
      it("should not call the function", function() {
        var object = {};
        var i = 0;
        object.call(each, function() { i++; });
        expect(i).toEqual(0);
      });
    });
  
    describe("when called on an non-empty object", function() {
      var object;
      beforeEach(function() {
        object = {a: "x", b: "y", c: "z"};
      });
      
      it("should call the function for each attribute of the object", function() {
        var i = 0;
        object.call(each, function() { i++; });
        expect(i).toEqual(3);
      });
      
      it("should call the function in the scope of the object", function() {
        objs = [];
        object.call(each, function() { objs.push(this); });
        expect(objs[0]).toBe(object);
        expect(objs[1]).toBe(object);
        expect(objs[2]).toBe(object);
      });
      
      it("should pass each attribute as the first parameter to the function", function() {
        attrs = [];
        object.call(each, function(attr) { attrs.push(attr); });
        expect(attrs[0]).toEqual("x");
        expect(attrs[1]).toEqual("y");
        expect(attrs[2]).toEqual("z");
      });
      
      it("should pass each attribute name as the second parameter to the function", function() {
        names = [];
        object.call(each, function(attr, name) { names.push(name); });
        expect(names[0]).toEqual("a");
        expect(names[1]).toEqual("b");
        expect(names[2]).toEqual("c");
      });
    });
  });

});

describe("Map Method", function() {
  var map = variables.map;
  
  describe("when not passed a function", function() {
    describe("when called on an non-empty array", function() {
      var array = ['bar', 'gir'];
      it("should cause a method missing error", function() {
        expect(function() { array.call(map); }).toThrow();
        expect(function() { array.call(map, 0); }).toThrow();
      });
    });
  });
  
  describe("when passed a function", function() {
    describe("when called on an array", function() {
      var array = [1,2,3];
      it("should return an array with the same length", function() {
        var i = 0;
        expect(array.call(map, function() { }).length).toEqual(array.length);
      });
      
      it("should return an array composed elements returned by each function call", function() {
        expect(array.call(map, function(number) { return number + 2; })).toEqual([3,4,5]);
      });
    });
  
    describe("when called on an empty array", function() {
      it("should not call the function", function() {
        var array = [];
        var i = 0;
        array.call(map, function() { i++; });
        expect(i).toEqual(0);
      });
    });
  
    describe("when called on an non-empty array", function() {
      var array;
      beforeEach(function() {
        array = ["a", "b", "c"];
      });
      
      it("should call the function for each element of the array", function() {
        var i = 0;
        array.call(map, function() { i++; });
        expect(i).toEqual(3);
      });
      
      it("should call the function in the scope of the array", function() {
        objs = [];
        array.call(map, function() { objs.push(this); });
        expect(objs[0]).toBe(array);
        expect(objs[1]).toBe(array);
        expect(objs[2]).toBe(array);
      });
      
      it("should pass each element as the first parameter to the function", function() {
        attrs = [];
        array.call(map, function(elem) { attrs.push(elem); });
        expect(attrs[0]).toEqual("a");
        expect(attrs[1]).toEqual("b");
        expect(attrs[2]).toEqual("c");
      });
      
      it("should pass each element index as the second parameter to the function", function() {
        indexes = [];
        array.call(map, function(elem, i) { indexes.push(i); });
        expect(indexes[0]).toEqual(0);
        expect(indexes[1]).toEqual(1);
        expect(indexes[2]).toEqual(2);
      });
      
      describe("when passed extra parameters", function() {
        var array = [1];
        it("should pass those parameters to the function", function() {
          var parameters;
          var parameterLength;
          array.call(map, function(elem, i, a, b, c) { 
            parameters = [a,b,c]; 
            parameterLength = arguments.length;
          }, "a", "b", "c");
          expect(parameterLength).toEqual(5);
          expect(parameters).toEqual(["a", "b", "c"]);
        });
      });
    });
  });
});

describe("Map Each Method", function() {
  
});