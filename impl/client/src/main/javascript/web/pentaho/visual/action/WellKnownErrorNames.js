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

define(function() {

  "use strict";

  /**
   * The `WellKnownErrorNames` enum is the class of well-known names of errors which occur
   * during visual actions.
   *
   * Error codes are present in the value of an {@link Error}'s `name` property.
   *
   * @memberOf pentaho.visual.action
   * @enum {string}
   * @readonly
   */
  var WellKnownErrorNames = {
    /**
     * This error can result from an [Update]{@link pentaho.visual.action.Update} action
     * when the given dataset does not have any rows or
     * when all of its rows do not have data which can be rendered.
     *
     * This can be the case, for example, if all of the rows in a dataset only have null measure values.
     *
     * @default
     */
    emptyData: "empty-data",

    /**
     * This error can result from an [Update]{@link pentaho.visual.action.Update} action
     * when the model's dataset contains data which is invalid for the visualization.
     *
     * This can be the case, for example,
     * if a Pie chart receives rows for which the sum of all measure values is 0.
     *
     * @default
     */
    invalidData: "invalid-data",

    /**
     * This error can result from an [Update]{@link pentaho.visual.action.Update} action
     * when the model's dataset is too big for being rendered by a view.
     *
     * Frequently, the rendering complexity is not dependent on the number of rows,
     * but, instead, is dependent on the product between the distinct number of tuples of certain column sets.
     *
     * @default
     */
    bigData: "big-data",

    /**
     * This error can result from any visual actions to signal that the model has changed,
     * invalidating or disabling the execution.
     *
     * For example, during an asynchronous [Update]{@link pentaho.visual.action.Update} execution,
     * the view can detect that the model has changed since the start of the execution and,
     * by signaling the error, request that the update action be repeated.
     *
     * Additionally, this error can be used by a
     * [Select]{@link pentaho.visual.action.Select} or [Execute]{@link pentaho.visual.action.Execute}
     * action execution to indicate that the action cannot be performed when the model has changed since
     * the last update execution.
     *
     * The name of the [ModelChangedError]{@link pentaho.visual.action.ModelChangedError} error.
     *
     * @default
     */
    modelChanged: "model-changed"
  };

  return Object.freeze(WellKnownErrorNames);
});
