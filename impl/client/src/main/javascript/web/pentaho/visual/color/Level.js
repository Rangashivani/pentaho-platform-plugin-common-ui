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
  "pentaho/type/String",
  "pentaho/type/mixins/Enum",
  "pentaho/i18n!messages"
], function(module, PentahoString, EnumMixin, bundle) {

  "use strict";

  /**
   * @name pentaho.visual.color.LevelType
   * @class
   * @extends pentaho.type.StringType
   * @extends pentaho.type.mixins.DiscreteDomainType
   *
   * @classDesc The type class of {@link pentaho.visual.color.Level}.
   */

  /**
   * @name pentaho.visual.color.Level
   * @class
   * @extends pentaho.type.String
   * @extends pentaho.type.mixins.DiscreteDomain
   *
   * @amd pentaho/visual/color/Level
   *
   * @classDesc The `Level` class is [String]{@link pentaho.type.String} based enumeration
   * that represents a **Level of Measurement**,
   * as understood by [S. S. Steven]{@link https://en.wikipedia.org/wiki/Level_of_measurement}
   * and as applied to the visual representation capabilities of a color palette.
   *
   * Currently, the following color palette levels of measurement are supported:
   *
   * * `nominal` - A _qualitative_ measurement level.
   *   The lowest in the hierarchy of levels of measurement.
   *   A **nominal** color palette can represent data visually while preserving the
   *   distinction between different things and also, possibly,
   *   enabling easy association of different, but somehow similar, things.
   *   However, a nominal color palette represents data in a way that conveys no
   *   preferential order between the various things.
   *
   *   See {@link pentaho.visual.color.palettes.nominalPrimary} for an example of a nominal color palette.
   *
   * * `quantitative` - Aggregates the _interval_ and _ratio_ levels of measurement,
   *    the highest in the hierarchy of levels of measurement.
   *    A **quantitative** color palette can represent data visually while preserving
   *    the order between different things.
   *    Additionally, it can represent the proportion between quantities (ratios),
   *    or, at least, the proportion between differences of quantities (intervals).
   *
   *    See {@link pentaho.visual.color.palettes.quantitativeGray5} for an example of a quantitative color palette.
   *
   * * `divergent` — A mixed type of color palette that can represent quantitative data
   *    while clearly dividing it in two "nominal" regions, separated by a reference value (typically zero).
   *
   *    See {@link pentaho.visual.color.palettes.divergentRyg5} for an example of a divergent color palette.
   *
   *  @see pentaho.visual.color.Palette#level
   *  @see pentaho.visual.color.PalettePropertyType#levels
   */

  return PentahoString.extend({

    $type: /** @lends pentaho.visual.color.LevelType# */{
      id: module.id,
      mixins: [EnumMixin],
      domain: ["nominal", "quantitative", "divergent"]
    }
  })
  .localize({$type: bundle.structured.Level})
  .configure();
});
