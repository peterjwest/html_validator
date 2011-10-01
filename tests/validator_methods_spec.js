
describe("English List method", function() {
  var englishList = variables.englishList;
  
  describe("when called on an array of strings", function() {
    describe("when the array has length one", function() {
      it("should return the item", function() {
        expect(["foo"].call(englishList)).toEqual("foo");
      });
    });
    
    describe("when the array has length two", function() {
      it("should return the items joined with 'and'", function() {
        expect(["foo", "bar"].call(englishList)).toEqual("foo and bar");
      });
    });
    
    describe("when the array has length more than two", function() {
      it("should return the items joined with a comma, and the last item joined with 'and'", function() {
        expect(["foo", "bar", "zim"].call(englishList)).toEqual("foo, bar and zim");
        expect(["foo", "bar", "zim", "gir"].call(englishList)).toEqual("foo, bar, zim and gir");
      });
    });
  });
});

describe("Group Unique Method", function() {
  var groupUnique = variables.groupUnique;

  describe("when called on an empty array", function() {
    it("should return an empty array", function() {
      expect([].call(groupUnique)).toEqual([]);
    });
  });
  describe("when called on a non-empty array", function() {
    it("should return an array with identical adjacent elements removed", function() {
      expect(["foo", "foo", "bar"].call(groupUnique)).toEqual(["foo", "bar"]);
      expect(["foo", "bar", "bar", "bar", "zim", "bar"].call(groupUnique)).toEqual(["foo", "bar", "zim", "bar"]);
    });
  });
});

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
  var stack = variables.stack;
  var computedDescendents = variables.computedDescendents;
  describe("when called on an object", function() {
    var object;
    describe("when passed a hash of items each with a hash of allowed_descendents and banned_descendents", function() {
      var hash = {
        a: {
          allowed_descendents: {a: true},
          banned_descendents: {}
        },
        b: {
          allowed_descendents: {c: true, d: true},
          banned_descendents: {a: true}
        },
        c: {
          allowed_descendents: {a: true, b: true, c: true, e: true},
          banned_descendents: {c: true}
        }
      };
      
      it("should use the stack of the object to collect a hash of allowed_descendents excluding banned_descendents", function() {
        object = {name: 'a'};
        expect(object.call(computedDescendents, hash)).toEqual({a: true});
        
        object = {name: 'c'};
        expect(object.call(computedDescendents, hash)).toEqual({a: true, b: true, e: true});
        
        object = {name: 'a', parent: {name: 'b'}};
        expect(object.call(computedDescendents, hash)).toEqual({c: true, d: true});
        
        object = {name: 'a', parent: {name: 'b', parent: {name: 'c'}}};
        expect(object.call(computedDescendents, hash)).toEqual({b: true, d: true, e: true});
      });
    });
  });
});

describe("Expand List Method", function() {
  
});

describe("Combine Lists Function", function() { 
  var combineLists = variables.combineLists;
  describe("when passed two strings", function() {
    describe("when the second string begins with +", function() {
      it("should return the two strings with the + removed, joined with a comma", function() {
        expect(combineLists("foo,bar", "+zim,gir")).toEqual("foo,bar,zim,gir");
      });
    });
    describe("when the second string doesn't begin with +", function() {
      it("should return the second string", function() {
        expect(combineLists("foo,bar", "zim,gir")).toEqual("zim,gir");
      });
    });
  });
});
