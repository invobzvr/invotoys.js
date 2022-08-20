// ==UserScript==
// @name         Hook.js
// @namespace    https://github.com/invobzvr
// @version      0.2
// @description  Javascript function hook
// @author       invobzvr
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/hook.js
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    const ORI = {};

    function performHook(ori, args, params) {
        if (typeof params.before === 'function') {
            const ret = params.before.apply(this, [args]);
            if (ret !== undefined) {
                return ret;
            }
        }
        let val = ori.apply(this, args);
        if (typeof params.after === 'function') {
            const ret = params.after.apply(this, [args, val]);
            if (ret !== undefined) {
                val = ret;
            }
        }
        return val;
    }

    Function.prototype.hook = function (params) {
        typeof params === 'function' && (params = {
            scope: window,
            before: params,
        });
        !params.scope && (params.scope = window);
        const ori = this,
            name = ori.name;
        ORI[name] = ori;
        params.scope[name] = function () {
            return performHook.apply(this, [ori, arguments, params]);
        }
    }

    Object.prototype.hook = function (prop, params) {
        typeof params === 'function' && (params = {
            before: params,
        });
        const ori = this[prop];
        this[prop] = function () {
            return performHook.apply(this, [ori, arguments, params]);
        }
        this[prop].__ORI__ = ori;
    }
})();