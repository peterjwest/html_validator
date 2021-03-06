describe("Shifted Function", function() {  
  describe("When passed an empty array", function() {
    it("should return an empty array", function() {
      expect(shifted([])).toEqual([]);
    });
  });
  
  describe("When passed a non-empty array", function() {
    it("should return an array with the first item removed", function() {
      expect(shifted([1,2,3])).toEqual([2,3]);
    });
  });
});

describe("Each Method", function() {
  describe("when not passed a function", function() {
    describe("when called on an non-empty object", function() {
      var object = {foo: 'bar', zim: 'gir'};
      it("should throw an error", function() {
        expect(function() { object.call(each); }).toThrow();
        expect(function() { object.call(each, 0); }).toThrow();
      });
    });
  });
  
  describe("when passed a function", function() {  
    describe("when called on an empty object", function() {
      it("should not call the function", function() {
        var object = {};
        var i = 0;
        object.call(each, function() { i++; });
        expect(i).toEqual(0);
      });
      
      it("should return an empty array", function() {
        var object = {};
        expect(object.call(each, function() { })).toEqual([]);
      });
    });
  
    describe("when called on an non-empty object", function() {
      var object;
      beforeEach(function() {
        object = {a: "x", b: "y", c: "z"};
      });
      
      it("should return an array composed elements returned by each function call", function() {
        expect(object.call(each, function(letter) { return "a" + letter; })).toEqual(["ax", "ay", "az"]);
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
      
      it("should return ", function() {
        var object = {};
        expect(object.call(each, function() { })).toEqual([]);
      });
    });
  });

});

describe("Map Method", function() {
  describe("when not passed a function", function() {
    describe("when called on an non-empty array", function() {
      var array = ['bar', 'gir'];
      it("should throw an error", function() {
        expect(function() { array.call(map); }).toThrow();
        expect(function() { array.call(map, 0); }).toThrow();
      });
    });
  });
  
  describe("when passed a function", function() {  
    describe("when called on an empty array", function() {
      it("should not call the function", function() {
        var array = [];
        var i = 0;
        array.call(map, function() { i++; });
        expect(i).toEqual(0);
      });
      
      it("should return an empty array", function() {
        var array = [];
        var i = 0;
        expect([].call(map, function() {})).toEqual([]);
      });
    });
  
    describe("when called on an non-empty array", function() {
      var array;
      beforeEach(function() {
        array = ["a", "b", "c"];
      });
      
      it("should return an array with the same length", function() {
        var i = 0;
        expect(array.call(map, function() { }).length).toEqual(array.length);
      });
      
      it("should return an array composed elements returned by each function call", function() {
        expect(array.call(map, function(letter) { return letter + "z"; })).toEqual(["az", "bz", "cz"]);
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

describe("Select Method", function() {
  describe("when not passed a function", function() {
    describe("when called on an non-empty array", function() {
      var array = ['bar', 'gir'];
      it("should throw an error", function() {
        expect(function() { array.call(select); }).toThrow();
        expect(function() { array.call(select, 0); }).toThrow();
      });
    });
  });
  
  describe("when passed a function", function() {  
    describe("when called on an empty array", function() {
      it("should not call the function", function() {
        var array = [];
        var i = 0;
        array.call(select, function() { i++; });
        expect(i).toEqual(0);
      });
      
      it("should return an empty array", function() {
        var array = [];
        var i = 0;
        expect([].call(select, function() {})).toEqual([]);
      });
    });
  
    describe("when called on an non-empty array", function() {
      var array;
      beforeEach(function() {
        array = ["a", "b", "c"];
      });
      
      it("should call the function for each element of the array", function() {
        var i = 0;
        array.call(select, function() { i++; });
        expect(i).toEqual(3);
      });

      it("should call the function in the scope of the array", function() {
        objs = [];
        array.call(select, function() { objs.push(this); });
        expect(objs[0]).toBe(array);
        expect(objs[1]).toBe(array);
        expect(objs[2]).toBe(array);
      });
      
      it("should pass each element as the first parameter to the function", function() {
        attrs = [];
        array.call(select, function(elem) { attrs.push(elem); });
        expect(attrs[0]).toEqual("a");
        expect(attrs[1]).toEqual("b");
        expect(attrs[2]).toEqual("c");
      });
      
      it("should pass each element index as the second parameter to the function", function() {
        indexes = [];
        array.call(select, function(elem, i) { indexes.push(i); });
        expect(indexes[0]).toEqual(0);
        expect(indexes[1]).toEqual(1);
        expect(indexes[2]).toEqual(2);
      });
      
      describe("when the function returns false", function() {
        it("should return an empty array", function() {
          expect(array.call(select, function() { return false; })).toEqual([]);
        });
      });
      
      describe("when the function returns true", function() {
        it("should return an identical array", function() {
          expect(array.call(select, function() { return true; })).toEqual(array);
        });
      });
      
      describe("when the function returns true for positive numbers", function() {
        it("should return an array of positive numbers", function() {
          expect([-3,-2,-1,1,2,3].call(select, function(n) { return n > 0; })).toEqual([1,2,3])
        });
      });
      
      describe("when the function returns true for even numbers", function() {
        it("should return an array of even numbers", function() {
          expect([0,1,2,3,4,5,6].call(select, function(n) { return n % 2 == 0; })).toEqual([0,2,4,6])
        });
      });
      
      describe("when passed extra parameters", function() {
        var array = [1];
        it("should pass those parameters to the function", function() {
          var parameters;
          var parameterLength;
          array.call(select, function(elem, i, a, b, c) { 
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

describe("Keys Method", function() {
  describe("when called on an object", function() {
    it("should return an array of the attribute names of that object", function() {
      expect({}.call(keys)).toEqual([]);
      expect({a:'x', b:'y', c:'z'}.call(keys)).toEqual(['a', 'b', 'c']);
    });
  });
});

describe("Values Method", function() {
  describe("when called on an object", function() {
    it("should return an array of the attribute values of that object", function() {
      expect({}.call(values)).toEqual([]);
      expect({a:'x', b:'y', c:'z'}.call(values)).toEqual(['x', 'y', 'z']);
    });
  });
});

describe("Method Method", function() {
  describe("when passed a function", function() {
    it("should run the function in the scope of the first argument", function() {
      var object = {};
      method(object, "key", function() { expect(this).toBe(object); });
    });
  });
});

describe("Merge Method", function() {
  describe("when called on a non-empty object", function() {
    var object;
    beforeEach(function() {
      object = {a: 'x', b: 'y', c: 'z'};
    });
    
    describe("when passed an empty object", function() {
      it("should return an object identical to the first object", function() {
        expect(object.call(merge, {})).toEqual(object);
      });
    });
    
    describe("when passed an object with exclusive parameters", function() {
      it("should return an object combining those parameters", function() {
        expect(object.call(merge, {d: 1, e: 2, f: 3})).toEqual({a: 'x', b: 'y', c: 'z', d: 1, e: 2, f: 3});
      });
    });
    
    describe("when called on an object with duplicate parameters", function() {
      it("should return an object combining those parameters, overriding those of the called object", function() {
        expect(object.call(merge, {b: 1, c: 2, d: 3})).toEqual({a: 'x', b: 1, c: 2, d: 3});
      });
    });
  });
  
  describe("when called on an empty object", function() {
    describe("when passed an empty object", function() {
      it("should return an empty object", function() {
        expect({}.call(merge, {})).toEqual({});
      });
    });
    
    describe("when passed a non-emtpy object", function() {
      var object = {a: 1, b: 2, c: 3};
      it("should return an object identical to the second object", function() {
        expect({}.call(merge, object)).toEqual(object);
      });
    });
  });
});

describe("Clone Method", function() {
  describe("when called on an object", function() {
    var object = {a: 1, b: 2, c: 3};
    it("should return a new object", function() {
      expect(object.call(clone)).not.toBe(object);
    });
  });
  
  describe("when called on an empty object", function() {
    it("should return an empty object", function() {
      expect({}.call(clone)).toEqual({});
    });
  });
  
  describe("when called on a non-empty object", function() {
    var object;
    beforeEach(function() {
      object = {a: [1,2,3], b: 2, c: "3"};
    });
    
    describe("when passed no extra parameters", function() {
      it("should return a new object with identical attributes to the called object", function() {
        expect(object.call(clone)).toEqual(object);
      });
    });
    
    describe("when passed an empty array as an extra parameter", function() {
      it("should return an empty object", function() {
        expect(object.call(clone, [])).toEqual({});
      });
    });
    
    describe("when passed an array as an extra parameter", function() {
      it("should return a new object with identical attributes to the called object, excluding attributes not listed in the array", function() {
        expect(object.call(clone, ["a", "c"])).toEqual({a: [1,2,3], c: "3"});
      });
    });
  });
});

describe("Hash method", function() {
  describe("when called on an empty array", function() {    
    it("should return an empty object", function() {
      expect([].call(hash)).toEqual({});
    });
  });
  
  describe("when called on a non-empty array", function() {
    var object;
    beforeEach(function() {
      object = ["a", "b", "c"];
    });
    
    describe("when passed no parameters", function() {
      it("should return an object with attributes named for each item in the array", function() {
        expect(object.call(hash)).toEqual({a: true, b: true, c: true});
      });
    });
    
    describe("when passed a function as a parameter", function() {
      it("should call that function for each item in the array", function() {
        var i = 0;
        object.call(hash, function() { i++; });
        expect(i).toEqual(3);
      });
      
      it("should pass the array item and its index to the function", function() {
        var args = [];
        object.call(hash, function(a, b) { args.push([a, b]); });
        expect(args).toEqual([["a", 0], ["b", 1], ["c", 2]]);
      });
      
      it("should assign the value returned to each attribute in the returned object", function() {
        expect(object.call(hash, function(a, b) { return a + (b + 1); })).toEqual({a: "a1", b: "b2", c: "c3"});
      });
    });
  });
});

describe("Numbered function", function() {
  describe("when passed a number as its second parameter", function() {
    it("should return that number plus one", function() {
      expect(numbered("item", 3)).toEqual(4);
    });
  });
});