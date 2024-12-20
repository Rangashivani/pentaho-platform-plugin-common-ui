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
  "pentaho/module!../IsIn",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    // TODO: Opted to keep isIn @private, undocumented, for 7.1. Currently its use could cause problems with the
    // DNF algorithm (simplifications are not performed).
    // Also, existing containers don't currently generate filters with isIn.

    /**
     * @name pentaho.data.filter.IsInType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the membership filter type.
     *
     * For more information see {@link pentaho.data.filter.IsIn}.
     *
     * @private
     */

    /**
     * @name pentaho.data.filter.IsIn
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsIn
     *
     * @classDesc The `IsIn` class represents a membership filter.
     * This filter selects elements in which the value of a certain property belongs to
     * a certain reference set: [values]{@link pentaho.data.filter.IsIn#values}.
     *
     * @description Creates a membership filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsIn} [spec] - A membership filter specification.
     *
     * @private
     */

    filter.IsIn = filter.Property.extend(/** @lends pentaho.data.filter.IsIn# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsIn;
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var values = this.values.toArray(function(value) { return value.valueOf(); });
        var L = values.length;

        return function isInContains(elem) {
          var value = elem.getv(property, true);
          if(value !== null) {
            var i = -1;
            while(++i < L) if(values[i] === value) return true;
          }

          return false;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        return (this.property || "") + " " + this.values.toArray(function(v) { return v.$key; }).join(" ");
      },

      $type: /** @lends pentaho.data.filter.IsInType# */{
        id: module.id,
        props: [
          // TODO: In the future, review if values should be of type pentaho.type.Value[].
          /**
           * Gets the possible values of the property.
           *
           * This getter is a shorthand for `this.get("values")`.
           *
           * @name values
           * @memberOf pentaho.data.filter.IsIn#
           * @type {Array}
           *
           * @readOnly
           */
          {
            // May be empty.
            name: "values",
            nameAlias: "v",
            valueType: ["element"],
            isBoundary: true
          }
        ]
      }
    });
  };
});
