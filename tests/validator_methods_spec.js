describe("Stack Method", function() {
  var stack = variables.stack;
  describe("when called on an object with no parent attribute", function() {
    var object = {a: 1};
    it("should return an array with that object", function() {
      expect(object.call(stack)).toEqual([object]);
    });
  });
  
 describe("when called on an object with a parent attribute", function() {
    var object1 = {parent: {a: 1}};
    var object2 = object1.parent;
    it("should return an array with that object and the parent attribute", function() {
      expect(object1.call(stack)).toEqual([object2, object1]);
    });
  });
  
  describe("when called on a chain of objects with parent attributes", function() {
    var object1 = {parent: {parent: {a: 1}}};
    var object2 = object1.parent;
    var object3 = object2.parent;
    it("should return an array with that object and the parent attribute", function() {
      expect(object1.call(stack)).toEqual([object3, object2, object1]);
    });
  });
});

describe("Draw Method", function() {
});

describe("Reassemble Method", function() {
});

describe("HTML Tags Method", function() {
});

describe("Computed Descendents Method", function() {
});

describe("Expand List Method", function() {
});