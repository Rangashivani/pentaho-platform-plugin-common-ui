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
  "./PrimitiveChange"
], function(module, PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Move# */{

    // To behind its position
    //     v-----+
    // a b c d e F
    // a b F c d e
    //
    // To ahead of its position
    //     +-----v
    // a b C d e f
    // a b d e f C

    /**
     * @alias Move
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     * @amd pentaho/type/action/Move
     *
     * @classDesc The `Move` class describes the primitive operation that
     * changes an element position inside a list.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {Array.<pentaho.type.Element>} elem - The element to be moved in the list.
     * @param {number} indexOld - The old index of the element in the list.
     * @param {number} indexNew - The new index of the element in the list.
     */
    constructor: function(elem, indexOld, indexNew) {

      /**
       * Gets the element that is about to be moved in the list.
       *
       * @type {pentaho.type.Element}
       * @readOnly
       */
      this.element = elem;

      /**
       * Gets the old index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.indexOld = indexOld;

      /**
       * Gets the new index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.indexNew = indexNew;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "move"
     * @override
     * @see pentaho.type.action.Change#type
     */
    get type() {
      return "move";
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems.splice(this.indexNew, 0, target.__elems.splice(this.indexOld, 1)[0]);
    }
  }, /** @lends pentaho.type.action.Move */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
