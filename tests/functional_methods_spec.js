describe("Each Method", function() {
  var each = variables.each;

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
  var map = variables.map;
  
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
  var select = variables.select;
  
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
  var keys = variables.keys;
  describe("when called on an object", function() {
    it("should return an array of the attribute names of that object", function() {
      expect({}.call(keys)).toEqual([]);
      expect({a:'x', b:'y', c:'z'}.call(keys)).toEqual(['a', 'b', 'c']);
    });
  });
});

describe("Values Method", function() {
  var values = variables.values;
  describe("when called on an object", function() {
    it("should return an array of the attribute values of that object", function() {
      expect({}.call(values)).toEqual([]);
      expect({a:'x', b:'y', c:'z'}.call(values)).toEqual(['x', 'y', 'z']);
    });
  });
});

describe("Method Method", function() {
  var method = variables.method;
  describe("when passed a function", function() {
    it("should run the function in the scope of the first argument", function() {
      var object = {};
      method(object, "key", function() { expect(this).toBe(object); });
    });
  });
});

describe("Is String Method", function() {
  var isString = variables.isString;
  describe("when passed a string", function() {
    it("should return true", function() {
      var object = {};
      expect("Test string".isString()).toBe(true);
      expect((new String("Another test string")).isString()).toBe(true);
    });
  });
  describe("when passed a non-string", function() {
    it("should return false", function() {
      var object = {};
      expect(["Some kind of array"].isString()).toBe(false);
      expect(new Object("Passed a string").isString()).toBe(false);
    });
  });
});

describe("Merge Method", function() {
  var merge = variables.merge;
  describe("when called on an object", function() {
    var object = {a: 'x', b: 'y', c: 'z'};
    describe("when passed an empty object", function() {
      it("should return the first object", function() {
        expect(object.call(merge, {})).toBe(object);
      });
    });
    describe("when called on an object with exclusive parameters", function() {
      it("should merge those parameters", function() {
        expect(object.call(merge, {d: 1, e: 2, f: 3})).toEqual({a: 'x', b: 'y', c: 'z', d: 1, e: 2, f: 3});
      });
    });
  });
});