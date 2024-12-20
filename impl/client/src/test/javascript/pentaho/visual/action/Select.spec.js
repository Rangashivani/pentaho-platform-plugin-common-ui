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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Select",
  "pentaho/visual/action/SelectionModes",
  "tests/pentaho/util/errorMatch"
], function(BaseAction, SelectAction, SelectionModes, errorMatch) {

  "use strict";

  describe("pentaho.visual.action.Select", function() {

    var customSelectionMode = function() {};

    it("should be defined", function() {

      expect(typeof SelectAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(SelectAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should mix in visual.action.mixins.Positioned", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("position" in SelectAction.prototype).toBe(true);
    });

    it("should mix in visual.action.mixins.Data", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("dataFilter" in SelectAction.prototype).toBe(true);
    });

    describe("new ({selectionMode})", function() {

      describe("spec.selectionMode", function() {

        it("should respect a specified function", function() {
          var selectAction = new SelectAction({selectionMode: customSelectionMode});

          expect(selectAction.selectionMode).toBe(customSelectionMode);
        });

        it("should accept specifying any of the standard mode names", function() {

          Object.keys(SelectionModes).forEach(function(name) {

            var selectAction = new SelectAction({selectionMode: name});

            expect(selectAction.selectionMode).toBe(SelectionModes[name]);
          });
        });

        it("should throw when specifying an unknown mode name", function() {

          expect(function() {
            var selectAction = new SelectAction({selectionMode: "foo"});
          }).toThrow(errorMatch.argInvalid("selectionMode"));
        });

        it("should throw when specifying something other than a string or a function", function() {

          expect(function() {
            var selectAction = new SelectAction({selectionMode: 1});
          }).toThrow(errorMatch.argInvalidType("selectionMode", ["string", "function"], "number"));
        });
      });
    });

    describe("#selectionMode", function() {

      it("should have a default value of SelectionModes.replace", function() {
        var selectAction = new SelectAction();

        expect(selectAction.selectionMode).toBe(SelectionModes.replace);
      });

      it("should respect a set function", function() {
        var selectAction = new SelectAction();

        selectAction.selectionMode = customSelectionMode;

        expect(selectAction.selectionMode).toBe(customSelectionMode);
      });

      it("should accept specifying any of the standard mode names", function() {

        Object.keys(SelectionModes).forEach(function(name) {

          var selectAction = new SelectAction();

          selectAction.selectionMode = name;

          expect(selectAction.selectionMode).toBe(SelectionModes[name]);
        });
      });

      it("should throw when specifying an unknown mode name", function() {

        var selectAction = new SelectAction();

        expect(function() {
          selectAction.selectionMode = "foo";
        }).toThrow(errorMatch.argInvalid("selectionMode"));
      });

      it("should throw when specifying something other than a string or a function", function() {

        var selectAction = new SelectAction();

        expect(function() {
          selectAction.selectionMode = 1;
        }).toThrow(errorMatch.argInvalidType("selectionMode", ["string", "function"], "number"));
      });

      it("should default to defaultSelectionMode when set to a nully value", function() {
        var customDefaultSelectionMode = function() {};

        function configureDefaultSelectionMode(localRequire) {
          localRequire.config({
            config: {
              "pentaho/modules": {
                "pentaho/visual/action/Select": {
                  config: {
                    defaultSelectionMode: customDefaultSelectionMode
                  }
                }
              }

            }
          });
        }

        return require.using(["pentaho/visual/action/Select"], configureDefaultSelectionMode, function(SelectAction) {

          var selectAction = new SelectAction();

          selectAction.selectionMode = customSelectionMode;

          selectAction.selectionMode = null;

          expect(selectAction.selectionMode).toBe(customDefaultSelectionMode);

          // ---

          selectAction.selectionMode = customSelectionMode;

          selectAction.selectionMode = undefined;

          expect(selectAction.selectionMode).toBe(customDefaultSelectionMode);
        });
      });
    });

    describe(".isSync", function() {

      it("should be synchronous", function() {

        expect(SelectAction.isSync).toBe(true);
      });
    });
  });
});
