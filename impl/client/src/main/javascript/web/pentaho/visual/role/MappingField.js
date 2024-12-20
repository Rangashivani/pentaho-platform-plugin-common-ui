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
  "pentaho/module!_",
  "pentaho/type/Complex",
  "pentaho/i18n!messages"
], function(module, Complex, bundle) {

  "use strict";

  /**
   * @name pentaho.visual.role.MappingField
   * @class
   * @extends pentaho.type.Complex
   *
   * @amd pentaho/visual/role/MappingField
   *
   * @classDesc The `MappingField` class represents a field in a
   * [visual role mapping]{@link pentaho.visual.role.AbstractMapping}.
   *
   * The `Mode` type is an [entity]{@link pentaho.type.ValueType#isEntity} type.
   *
   * @see pentaho.visual.role.AbstractMapping
   *
   * @description Creates a visual role mapping field instance.
   * @constructor
   * @param {pentaho.visual.role.spec.MappingField} [spec] A visual role mapping field specification.
   */
  return Complex.extend(/** @lends pentaho.visual.role.MappingField# */{

    constructor: function(spec, keyArgs) {
      this.base(this.$type.normalizeInstanceSpec(spec), keyArgs);
    },

    /**
     * Gets the (immutable) key of the visual role mapping field.
     *
     * The key is the value of the [name]{@link pentaho.visual.role.MappingField#name} property.
     *
     * @type {string}
     * @readOnly
     * @override
     * @see pentaho.type.ValueType#isEntity
     */
    get $key() {
      return this.name;
    },

    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      var spec = this.base(keyArgs);

      if(spec.constructor === Object) {
        // If only the name is output, then return it directly.
        var count = 0;
        var name = null;

        /* eslint guard-for-in: 0 */
        for(var p in spec) {
          count++;
          if(count > 1 || p !== "name") break;
          // count === 0 && p === name
          name = spec.name;
        }

        if(name && count === 1) {
          spec = name;
        }
      }

      return spec;
    },

    $type: /** @lends pentaho.visual.role.MappingFieldType# */{

      id: module.id,

      // @override
      _normalizeInstanceSpec: function(valueSpec) {
        // The name property?
        return (typeof valueSpec === "string") ? {name: valueSpec} : valueSpec;
      },

      // @override
      hasNormalizedInstanceSpecKeyData: function(valueSpec) {
        return valueSpec.name !== undefined;
      },

      props: [
        /**
         * Gets or sets the name of the field.
         *
         * This property is immutable and can only be specified at construction time.
         *
         * This property is required.
         *
         * @name pentaho.visual.role.MappingField#name
         * @type {string}
         * @see pentaho.visual.role.spec.IMappingField#name
         */
        {name: "name", valueType: "string", isRequired: true, isReadOnly: true}
      ]
    }
  })
  .localize({$type: bundle.structured.MappingField})
  .configure();
});
