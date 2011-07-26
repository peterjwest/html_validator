describe("Each Method", function() {
  var object = {foo: "bar", zim: "gir"};
  var each = variables.each;
    describe("when passed a function", function() {
  });
  
  describe("when not passed a function", function() {
    it("should cause a method missing error", function() {
      expect(function() { object.call(each); }).toThrow("Cannot call method 'apply' of undefined");
      expect(function() { object.call(each, 0); }).toThrow("Object 0 has no method 'apply'");
    });
  });
  
  describe("when called on an object", function() {
  });
  
  describe("when called on an array", function() {
  });
});

describe("Map Method", function() {
  var map = variables.map;
});