// ==UserScript==
// @name         Custom pbd
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description
// @author       invobzvr
// @match        *://pan.baidu.com/*
// @grant        none
// @homepageURL  https://github.com/invobzvr/tmjs.toys
// @supportURL   https://github.com/invobzvr/tmjs.toys/issues
// @license      GPL-3.0
// ==/UserScript==

(function() {
    // Cookie BDCLND
    // window.metaData.FILENAME

    const ORI_REPLACE = String.prototype.replace;
    String.prototype.replace = function() {
        if ([...arguments].join() == '/\\w/g,*') {
            return this;
        }
        return ORI_REPLACE.apply(this, arguments);
    }

    switch (location.pathname) {
        case '/share/init':
            window.accessCode.autocomplete = 'off'
            break;
    }
})();