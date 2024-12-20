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
  "module",
  "pentaho/lang/Base",
  "./util",
  "./impl/Variable",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, Base, sceneUtil, Variable, O, error) {

  var Scene = Base.extend(module.id, /** @lends pentaho.visual.scene.Base# */{

    /**
     * @classDesc The `Scene` class represents one distinct visual state which is represented
     * visually by one or more visual elements.
     *
     * Scenes are *not* needed to implement visualization [views]{@link pentaho.visual.impl.View}.
     * However, their use simplifies their implementation in many use cases.
     *
     * Scenes have a map of visual variables,
     * [vars]{@link pentaho.visual.scene.Base#vars} whose values are inherited from parent to child scenes.
     *
     * To *create scenes*, most view implementations can simply use the [scene.Base.buildScenesFlat] method.
     * This method creates one parent scene having one child scene per row of the model's dataset.
     * In child scenes,
     * for each visual role there will be a correspondingly named variable having the value of the visual role.
     *
     * For handling *user interaction*,
     * the scene instances' [createFilter]{@link pentaho.visual.scene.Base#createFilter} method provides
     * an easy way to create a filter that selects the data from which the scene was generated based on its
     * distinguishing field values.
     * This filter can then be passed to a [data action]{@link pentaho.visual.action.mixins.Data} such as
     * [Select]{@link pentaho.visual.action.Select} or [Execute]{@link pentaho.visual.action.Execute}.
     *
     * When *communicating with external parties*, field values must be used and visual variable values are not
     * generally meaningful.
     * The [invert]{@link pentaho.visual.scene.Base#invert} method allows directly obtaining the distinguishing
     * field values that are associated with a scene.
     *
     * @alias Base
     * @memberOf pentaho.visual.scene
     * @class
     * @extends pentaho.lang.Base
     *
     * @description Creates a scene instance.
     * @constructor
     * @param {pentaho.visual.scene.Base} parent - The parent scene, if any.
     * @param {pentaho.visual.Model} model - The model. Required if `parent` is not specified.
     */
    constructor: function(parent, model) {

      var hasParent = parent != null;
      if(hasParent) {
        this.parent = parent;
        this.index = parent.__appendChildCore(this);
        this.vars = Object.create(parent.vars);

      } else {
        this.parent = null;
        this.index = -1;
        this.vars = Object.create(null);

        O.setConst(this.vars, "$root", this);

        if(model == null) {
          throw error.argRequired("model");
        }
        this.__model = model;
      }
    },

    /**
     * Gets the parent scene, if any, or `null` if none.
     *
     * @type {pentaho.visual.scene.Base}
     * @readOnly
     */
    parent: null,

    /**
     * Gets the child index of this scene, if it has a parent, or `-1` if not.
     *
     * @type {number}
     * @readOnly
     */
    index: -1,

    /**
     * Gets the array of child scenes.
     *
     * The returned array cannot be modified directly.
     *
     * @type {Array.<pentaho.visual.scene.Base>}
     * @readOnly
     */
    children: Object.freeze([]),

    /**
     * Gets the root scene of the tree that this scene belongs to.
     *
     * @type {pentaho.visual.scene.Base}
     * @readOnly
     */
    get root() {
      return this.vars.$root;
    },

    /**
     * Gets the associated visualization model.
     *
     * @type {pentaho.visual.Model}
     * @readOnly
     */
    get model() {
      return this.root.__model;
    },

    /**
     * Appends a given child scene in the local children array, creating one if this is the first child.
     *
     * @param {pentaho.visual.scene.Base} child - The child scene.
     * @return {number} The index at which the given child scene was inserted.
     * @private
     */
    __appendChildCore: function(child) {

      var children = O.getOwn(this, "children") || (this.children = []);
      var index = children.length;

      children.push(child);

      return index;
    },

    /**
     * Creates a filter that selects the data represented by this scene.
     *
     * This method provides an easy way to create a filter that selects the data that this scene visually represents
     * based on its distinguishing field values.
     *
     * This filter can then be passed to a [data action]{@link pentaho.visual.action.mixins.Data} such as
     * [Select]{@link pentaho.visual.action.Select} or [Execute]{@link pentaho.visual.action.Execute}.
     *
     * In certain circumstances, the returned value may be `null`. A filter can only be created for a scene
     * if its variables entail distinguishing fields (in the sense of being _effective keys_, as defined in
     * [scene.util.invertVars]{@link pentaho.visual.scene.util.invertVars}) of the associated model's data.
     *
     * @return {pentaho.data.filter.Abstract} The filter, if one can be created; `null`, otherwise.
     */
    createFilter: function() {
      return sceneUtil.createFilterFromVars(this.vars, this.model);
    },

    /**
     * Gets a data cells map which corresponds to the values of visual role variables of this scene.
     *
     * When *communicating with external parties*, field values must be used and visual variable values are not
     * generally meaningful. Use this method to obtain the distinguishing field values represented by this scene.
     *
     * @param {?object} [keyArgs] The keyword arguments object.
     * @param {boolean} [keyArgs.includeMeasureFields=false] Indicates that measure fields should also
     * be included.
     * In practice, indicates that all fields should be included.
     *
     * @return {Object.<string, pentaho.data.ICell>} A data cells map, possibly empty.
     *
     * @see pentaho.visual.scene.util.invertVars
     */
    invert: function(keyArgs) {
      return sceneUtil.invertVars(this.vars, this.model, keyArgs);
    }
  }, /** @lends pentaho.visual.scene.Base*/ {
    /**
     * Builds a flat, single-level scene tree according to the data and visual roles of a given model.
     *
     * This method creates one parent scene having one child scene per row of the
     * [model's dataset]{@link pentaho.visual.Model#data}.
     * In child scenes, for each visual role there will be a correspondingly named variable having the value
     * of the visual role.
     *
     * @param {pentaho.visual.Model} model - The visualization model. Must be valid.
     *
     * @return {pentaho.visual.scene.Base} The parent scene.
     */
    buildScenesFlat: function(model) {

      var parentScene = new Scene(/* parent: */null, model);

      // assert model.isValid

      var data = model.data;

      // Collect visual role mapperInfos from model.
      var mapperInfos = [];
      model.$type.eachVisualRole(function(propType) {
        var mapping = model.get(propType);
        if(mapping.hasFields) {
          mapperInfos.push({
            name: propType.name,
            mapper: createMapper(mapping, data)
          });
        }
      });

      // ---

      var rowIndex = -1;
      var rowCount = data.getNumberOfRows();
      var mapperCount = mapperInfos.length;

      while(++rowIndex < rowCount) {

        var childScene = new Scene(parentScene);

        var mapperIndex = -1;

        while(++mapperIndex < mapperCount) {

          var mapperInfo = mapperInfos[mapperIndex];

          childScene.vars[mapperInfo.name] = mapperInfo.mapper(rowIndex);
        }
      }

      return parentScene;
    }
  });

  return Scene;

  function createMapper(mapping, data) {

    var fieldIndexes = mapping.fieldIndexes;

    var mode = mapping.mode;

    // assert mode != null;

    if(mode.dataType.isList) {
      return createMultipleFieldsMapper(data, fieldIndexes);
    }

    return createSingleFieldMapper(data, fieldIndexes[0]);
  }

  function createSingleFieldMapper(data, fieldIndex) {

    return function singleFieldMapper(rowIndex) {
      return data.getCell(rowIndex, fieldIndex);
    };
  }

  function createMultipleFieldsMapper(data, fieldIndexes) {

    return function multipleFieldsMapper(rowIndex) {
      return data.getRowCells(rowIndex, fieldIndexes);
    };
  }
});
