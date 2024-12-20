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
  "pentaho/_core/module/Service",
  "pentaho/shim/es6-promise"
], function(ModuleService) {

  "use strict";

  /* eslint max-nested-callbacks:0 */

  describe("pentaho._core.module.Service", function() {

    function createMetaMock() {

      function Meta(id) {
        this.id = id;
      }

      Meta.prototype.loadAsync = jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve());

      return Meta;
    }

    function createMetaModuleServiceMock() {

      var moduleMetaService = jasmine.createSpyObj("moduleMetaService", [
        "getInstancesOf", "getInstanceOf", "getSubtypesOf", "getSubtypeOf"
      ]);

      moduleMetaService.getInstancesOf.and.returnValue([]);
      moduleMetaService.getInstanceOf.and.returnValue(null);

      moduleMetaService.getSubtypesOf.and.returnValue([]);
      moduleMetaService.getSubtypeOf.and.returnValue(null);

      return moduleMetaService;
    }

    var moduleMetaService;
    var moduleService;
    var Meta;

    beforeEach(function() {
      moduleMetaService = createMetaModuleServiceMock();
      moduleService = new ModuleService(moduleMetaService);
      Meta = createMetaMock();
    });

    describe("new Service(metaService)", function() {

      it("should return an instance", function() {
        expect(moduleService instanceof ModuleService).toBe(true);
      });
    });

    describe("#getInstancesOfAsync(typeIdOrAlias)", function() {

      it("should return a promise for an empty array when given an undefined type or " +
        "when a defined type has no instances", function() {

        var promise = moduleService.getInstancesOfAsync("undefinedType");

        expect(promise instanceof Promise);

        return promise.then(function(result) {
          expect(result instanceof Array).toBe(true);
          expect(result.length).toBe(0);
        });
      });

      it("should return a rejected promise when given a module which is not of kind 'type'", function() {

        var error = new Error();

        moduleMetaService.getInstancesOf.and.callFake(function() {
          throw error;
        });

        return moduleService.getInstancesOfAsync("cat1")
          .then(function() {
            return Promise.reject("Expected to reject.");
          }, function(ex) {
            expect(ex).toBe(error);
          });
      });

      it("should return a promise for all instances of the given type", function() {
        var value1 = {};
        var meta1 = new Meta("1");
        meta1.loadAsync = jasmine.createSpy("loadAsync 1").and.returnValue(Promise.resolve(value1));

        var value2 = {};
        var meta2 = new Meta("2");
        meta2.loadAsync = jasmine.createSpy("loadAsync 2").and.returnValue(Promise.resolve(value2));

        moduleMetaService.getInstancesOf.and.returnValue([meta1, meta2]);

        return moduleService.getInstancesOfAsync("x")
          .then(function(result) {
            expect(moduleMetaService.getInstancesOf).toHaveBeenCalledTimes(1);
            expect(moduleMetaService.getInstancesOf).toHaveBeenCalledWith("x");

            expect(result.length).toBe(2);
            expect(result[0]).toBe(value1);
            expect(result[1]).toBe(value2);
          });
      });

      it("should return a promise for all successfully loaded instances of the given type", function() {
        var value1 = {};
        var meta1 = new Meta("1");
        meta1.loadAsync = jasmine.createSpy("loadAsync 1").and.returnValue(Promise.resolve(value1));

        var error2 = new Error();
        var meta2 = new Meta("2");
        meta2.loadAsync = jasmine.createSpy("loadAsync 2").and.returnValue(Promise.reject(error2));

        moduleMetaService.getInstancesOf.and.returnValue([meta1, meta2]);

        return moduleService.getInstancesOfAsync("x")
          .then(function(result) {

            expect(result.length).toBe(1);
            expect(result[0]).toBe(value1);
          });
      });
    });

    describe("#getInstanceOfAsync(typeIdOrAlias)", function() {

      it("should return a promise of undefined when given an undefined type or " +
        "one which has no instances", function() {

        var promise = moduleService.getInstanceOfAsync("undefinedType");

        expect(promise instanceof Promise);

        return promise.then(function(result) {
          expect(result).toBe(undefined);
        });
      });

      it("should return a rejected promise when given a module which is not of kind 'type'", function() {

        var error = new Error();

        moduleMetaService.getInstanceOf.and.callFake(function() {
          throw error;
        });

        return moduleService.getInstanceOfAsync("cat1")
          .then(function() {
            return Promise.reject("Expected to reject.");
          }, function(ex) {
            expect(ex).toBe(error);
          });
      });
    });

    describe("#getSubtypesOfAsync(baseTypeIdOrAlias)", function() {

      it("should return a promise for an empty array when given an undefined type or " +
        "when a defined type has no subtypes", function() {

        var promise = moduleService.getSubtypesOfAsync("undefinedType");

        expect(promise instanceof Promise);

        return promise.then(function(result) {
          expect(result instanceof Array).toBe(true);
          expect(result.length).toBe(0);
        });
      });

      it("should return a rejected promise when given a module which is not of kind 'type'", function() {

        var error = new Error();

        moduleMetaService.getSubtypesOf.and.callFake(function() {
          throw error;
        });

        return moduleService.getSubtypesOfAsync("cat1")
          .then(function() {
            return Promise.reject("Expected to reject.");
          }, function(ex) {
            expect(ex).toBe(error);
          });
      });

      it("should return a promise for all subtypes of the given type", function() {
        var Value1 = {};
        var meta1 = new Meta("1");
        meta1.loadAsync = jasmine.createSpy("loadAsync 1").and.returnValue(Promise.resolve(Value1));

        var Value2 = {};
        var meta2 = new Meta("2");
        meta2.loadAsync = jasmine.createSpy("loadAsync 2").and.returnValue(Promise.resolve(Value2));

        moduleMetaService.getSubtypesOf.and.returnValue([meta1, meta2]);

        return moduleService.getSubtypesOfAsync("x")
          .then(function(result) {
            expect(moduleMetaService.getSubtypesOf).toHaveBeenCalledTimes(1);
            expect(moduleMetaService.getSubtypesOf).toHaveBeenCalledWith("x");

            expect(result.length).toBe(2);
            expect(result[0]).toBe(Value1);
            expect(result[1]).toBe(Value2);
          });
      });

      it("should return a promise for all successfully loaded subtypes of the given type", function() {
        var Value1 = {};
        var meta1 = new Meta("1");
        meta1.loadAsync = jasmine.createSpy("loadAsync 1").and.returnValue(Promise.resolve(Value1));

        var error2 = new Error();
        var meta2 = new Meta("2");
        meta2.loadAsync = jasmine.createSpy("loadAsync 2").and.returnValue(Promise.reject(error2));

        moduleMetaService.getSubtypesOf.and.returnValue([meta1, meta2]);

        return moduleService.getSubtypesOfAsync("x")
          .then(function(result) {

            expect(result.length).toBe(1);
            expect(result[0]).toBe(Value1);
          });
      });
    });

    describe("#getSubtypeOfAsync(baseTypeIdOrAlias)", function() {

      it("should return a promise of undefined when given an undefined type or " +
        "one which has no subtypes", function() {

        var promise = moduleService.getSubtypeOfAsync("undefinedType");

        expect(promise instanceof Promise);

        return promise.then(function(result) {
          expect(result).toBe(undefined);
        });
      });

      it("should return a rejected promise when given a module which is not of kind 'type'", function() {

        var error = new Error();

        moduleMetaService.getSubtypeOf.and.callFake(function() {
          throw error;
        });

        return moduleService.getSubtypeOfAsync("cat1")
          .then(function() {
            return Promise.reject("Expected to reject.");
          }, function(ex) {
            expect(ex).toBe(error);
          });
      });
    });
  });
});
