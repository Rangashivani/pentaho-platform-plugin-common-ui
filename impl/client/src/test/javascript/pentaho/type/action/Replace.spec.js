/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/type/Complex",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/Replace"
], function(Complex, Transaction, Replace) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.action.Replace", function() {

    var DerivedComplex;
    var ComplexOfComplex;
    var propY;

    beforeAll(function() {

      DerivedComplex = Complex.extend({
        $type: {
          props: ["x"]
        }
      });

      ComplexOfComplex = Complex.extend({
        $type: {
          props: [{name: "y", valueType: DerivedComplex}]
        }
      });

      propY = ComplexOfComplex.type.get("y");
    });

    it("should be defined", function() {
      expect(typeof Replace).toBeDefined();
    });

    describe("#type", function() {
      it("should return a string with the value `replace`", function() {
        expect(Replace.prototype.type).toBe("replace");
      });
    });

    describe("#_apply", function() {

      var scope;

      beforeEach(function() {
        scope = Transaction.enter();
      });

      afterEach(function() {
        scope.dispose();
      });

      it("should replace the property value and be visible as ambient value", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        expect(derived.x).toBe("0");

        // ---

        derived.x = "1";

        // ---

        expect(derived.x).toBe("1");
      });

      it("should reuse a Replace change object when set twice", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        var change1 = derived.$changeset.getChange("x");

        derived.x = "2";

        var change2 = derived.$changeset.getChange("x");

        // ---

        expect(change2).toBe(change1);
      });

      it("should replace the property value and remain changed when committed", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        // ---

        scope.accept();

        // ---

        expect(derived.x).toBe("1");
      });

      it("should replace the property value but have the original value when rejected", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value when exited", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        // ---

        scope.exit();

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value if changes cleared, " +
        "as ambient value", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        // ---

        derived.$changeset.clearChanges();

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value if changes " +
        "cleared and committed", function() {

        var derived = new DerivedComplex({x: "0"});

        // ---

        derived.x = "1";

        // ---

        derived.$changeset.clearChanges();
        scope.accept();

        // ---

        expect(derived.x).toBe("0");
      });
    });

    describe("references", function() {

      function expectSingleRefTo(elem, to, prop) {

        var refs = elem.$references;

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(to);
        expect(refs[0].property).toBe(prop);
      }

      function expectNoRefs(elem) {

        var refs = elem.$references;

        expect(!refs || !refs.length).toBe(true);
      }

      var scope;

      beforeEach(function() {
        scope = Transaction.enter();
      });

      afterEach(function() {
        scope.dispose();
      });

      // coverage
      describe("when element is simple", function() {

        it("should not try to add or remove references", function() {

          var target = new DerivedComplex({x: "1"});

          // ---

          target.x = "2";
        });

        it("should not try to cancel removed references when changes are cleared", function() {

          var target = new DerivedComplex({x: "1"});

          // ---

          target.x = "2";

          // ---

          target.$changeset.clearChanges();
        });
      });

      describe("when element is complex", function() {

        it("should remove add and remove references as soon as the change is made, as ambient values", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);

          // ---

          target.y = elem2;

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, target, propY);
        });

        it("should add and remove references but should have no effect if rejected", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references but should have no effect if exited from", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;

          // ---

          scope.exit();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should really add and remove references if committed", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, target, propY);
        });

        it("should cancel added and removed references when changes are cleared, in ambient values", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;

          // ---

          target.$changeset.clearChanges();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should cancel added and removed references when changes are cleared, and committed", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;

          // ---

          target.$changeset.clearChanges();

          scope.accept();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
            "it should restore the changed references and become visible again as ambient values", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;
          target.y = elem1;

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
            "it should restore the changed references and still be there when committed", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;
          target.y = elem1;

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
           "it should restore the changed references and still be there when rejected", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});

          // ---

          target.y = elem2;
          target.y = elem1;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, as ambient values", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});
          var elem3 = new DerivedComplex({x: "3"});

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);

          // ---

          target.y = elem2;

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, target, propY);
          expectNoRefs(elem3);

          // ---

          target.y = elem3;

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectSingleRefTo(elem3, target, propY);
        });

        it("should add and remove references, but if another value is set, " +
           "references should be changed again, and still be there if committed", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});
          var elem3 = new DerivedComplex({x: "3"});

          // ---

          target.y = elem2;
          target.y = elem3;

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectSingleRefTo(elem3, target, propY);
        });

        it("should add and remove references, but if another value is set, " +
           "references should be changed again, but be forgotten if rejected", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});
          var elem3 = new DerivedComplex({x: "3"});

          // ---

          target.y = elem2;
          target.y = elem3;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, but be forgotten if changes cleared, as ambient values", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});
          var elem3 = new DerivedComplex({x: "3"});

          // ---

          target.y = elem2;
          target.y = elem3;

          // ---

          target.$changeset.clearChanges();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, but be forgotten if changes cleared, and committed", function() {

          var target = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = target.y;
          var elem2 = new DerivedComplex({x: "2"});
          var elem3 = new DerivedComplex({x: "3"});

          // ---

          target.y = elem2;
          target.y = elem3;

          // ---

          target.$changeset.clearChanges();
          scope.accept();

          // ---

          expectSingleRefTo(elem1, target, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });
      });
    });
  });
});
