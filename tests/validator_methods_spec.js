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

describe("Reassemble Method", function() {
  var reassemble = variables.reassemble;
  describe("when passed an object with no children attribute", function() {
    var object;
    it("should return the html and endHtml attributes joined, if they exist", function() {
      object = {html: "<div>", endHtml: "</div>"};
      expect(object.call(reassemble)).toEqual(object.html+object.endHtml);
      object = {html: "<img>"};
      expect(object.call(reassemble)).toEqual(object.html);
      object = {endHtml: "</div>"};
      expect(object.call(reassemble)).toEqual(object.endHtml);
    });
  });
  
  describe("when passed an object with a children attribute which is an empty array", function() {
    it("should return the html and endHtml attributes joined, if they exist", function() {
      var object = {html: "<div>", endHtml: "</div>", children: []};
      expect(object.call(reassemble)).toEqual(object.html+object.endHtml);
    });
  });
  
  describe("when passed an object with a children attribute which is a non-empty array", function() {
    it("should return the html and endHtml attributes wrapping reassemble called on each item in the array joined", function() {
      var object = {
        html: "<div>", 
        endHtml: "</div>", 
        children: [
          {html: "<img>"}, 
          {html: "<p>", endHtml: "</p>", children: [{html: "<br>"}]}
        ]
      };
      var expected = object.html+object.children[0].call(reassemble)+object.children[1].call(reassemble)+object.endHtml;
      expect(object.call(reassemble)).toEqual(expected);
    });
  });
});

describe("HTML Tags Method", function() {
  var htmlTags = variables.htmlTags;
  describe("when passed an empty array", function() {
    it("should return an empty array", function() {
      expect([].call(htmlTags)).toEqual([]);
    });
  });
  describe("when passed an array of objects", function() {
    it("should return an array excluding items with a 'name' attribute of '#text' or '#comment'", function() {
      var array = [{name:"div"}, {name:"#text"}, {name:"#comment"}, {name:"img"}];
      expect(array.call(htmlTags)).toEqual([array[0], array[3]]);
    });
  });
});

describe("Computed Descendents Method", function() {
});

describe("Expand List Method", function() {
});