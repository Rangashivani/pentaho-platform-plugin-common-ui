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
  "./_transactionControl",
  "pentaho/lang/Base",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/util/logger"
], function(module, transactionControl, Base, O, error, logger) {

  "use strict";

  return Base.extend(module.id, /** @lends pentaho.type.action.AbstractTransactionScope# */{

    /**
     * @alias AbstractTransactionScope
     * @memberOf pentaho.type.action
     * @class
     *
     * @classDesc The `AbstractTransactionScope` class is the abstract base class
     * of classes that control the
     * [ambient/current transaction]{@link pentaho.type.action.Transaction#current}.
     *
     * @constructor
     * @description Creates a `CommittedScope`.
     *
     * @param {pentaho.type.action.Transaction} [transaction] The associated transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the specified transaction is resolved.
     *
     * @throws {pentaho.type.action.TransactionRejectedError} When this is the root scope of the specified transaction
     * and the transaction is automatically rejected due to a concurrency error.
     */
    constructor: function(transaction) {
      /**
       * Gets the associated transaction, if any, or `null`.
       *
       * @name transaction
       * @memberOf pentaho.type.action.AbstractTransactionScope#
       * @type {pentaho.type.action.Transaction}
       * @readOnly
       */
      O.setConst(this, "transaction", transaction || null);

      /**
       * Indicates if this scope is the ambient transaction's root/outermost scope.
       *
       * @name isRoot
       * @memberOf pentaho.type.action.TransactionScope#
       * @type {boolean}
       * @readOnly
       */
      O.setConst(this, "isRoot", (!!transaction && !transaction.__scopeCount));

      /**
       * Indicates if the scope has not been exited from.
       *
       * @type {boolean}
       * @default false
       * @private
       */
      this.__isInside = true;

      // Entering. May throw if already resolved or concurrency error.
      if(transaction) transaction.__scopeEnter();
      transactionControl.enterScope(this);
    },

    /**
     * Throws an error if the scope has been exited from or is not the current scope.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the scope has been exited from or
     * it is not the current scope.
     *
     * @protected
     */
    _assertInsideAndCurrent: function() {
      if(!this.__isInside) throw this.__getErrorNotInside();
      if(!this.isCurrent) throw this.__getErrorNotCurrent();
    },

    /**
     * Creates an error saying the scope has already been exited.
     *
     * @return {pentaho.lang.OperationInvalidError} The new error.
     *
     * @private
     */
    __getErrorNotInside: function() {
      return error.operInvalid("Scope has been exited from.");
    },

    /**
     * Gets an error saying the scope is not the current scope.
     *
     * @return {pentaho.lang.OperationInvalidError} The new error.
     *
     * @private
     */
    __getErrorNotCurrent: function() {
      return error.operInvalid("Scope is not the current scope.");
    },

    /**
     * Gets a value that indicates if this scope has not been exited.
     *
     * @type {boolean}
     * @readOnly
     */
    get isInside() {
      return this.__isInside;
    },

    /**
     * Gets a value that indicates if this scope is the current scope.
     *
     * The current scope is the innermost scope.
     *
     * @type {boolean}
     * @readOnly
     */
    get isCurrent() {
      return this.__isInside && (this === transactionControl.currentScope);
    },

    /**
     * Calls a given function within the scope and safely exits from the scope.
     *
     * @param {function(pentaho.type.action.TransactionScope) : *} fun - The function to call within the scope.
     * The function is called with the `this` context specified in argument `ctx`.
     * The return value of `fun` is returned back from this method.
     *
     * @param {?object} [ctx] The `this` context in which to call `fun`.
     * When unspecified, the function will have a `null` this.
     *
     * @return {*} The value returned by `fun`.
     *
     * @throws {Error} Any error thrown from within `fun`.
     */
    using: function(fun, ctx) {
      try {
        return fun.call(ctx, this);
      } finally {
        this.exit();
      }
    },

    /**
     * Exits the scope.
     *
     * After this operation, the scope cannot be operated on anymore.
     * However,
     * properties like
     * [transaction]{@link pentaho.type.action.AbstractTransactionScope#transaction}
     * remain available for reading.
     *
     * If this method is called and the the scope has already been exited from, or
     * is not the current scope, a warning is logged,
     * unless `keyArgs.sloppy` is `true`.
     *
     * @param {?object} [keyArgs] The keyword arguments.
     * @param {boolean} [keyArgs.sloppy] Indicates that no warning should be logged
     * if this method is called when the scope has already been exited from or is not the current scope.
     *
     * @return {pentaho.type.action.AbstractTransactionScope} This scope.
     */
    exit: function(keyArgs) {

      if(!O.getOwn(keyArgs, "sloppy", false)) {
        var error = !this.__isInside ? this.__getErrorNotInside() :
          !this.isCurrent ? this.__getErrorNotCurrent() : null;

        if(error !== null) {
          logger.warn(error.message);
        }
      }

      if(this.__isInside) {
        this.__exit();
      }

      return this;
    },

    /**
     * Exits the scope locally and notifies its transaction.
     *
     * @private
     */
    __exit: function() {

      this.__exitLocal();

      if(this.transaction) this.transaction.__scopeExit();

      transactionControl.exitScope();
    },

    /**
     * Exits the scope locally.
     *
     * @private
     * @internal
     */
    __exitLocal: function() {
      this.__isInside = false;
    },

    /**
     * Exits the scope, without any warnings in case it is not inside or is not the current scope.
     *
     * This method is equivalent to calling [exit]{@link pentaho.type.action.AbstractTransactionScope#exit}
     * with `keyArgs.sloppy` with value `true`.
     */
    dispose: function() {
      this.exit({sloppy: true});
    }
  });
});
