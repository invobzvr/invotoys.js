// ==UserScript==
// @name         Custom bilivideo
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  B站(bilibili)视频扩展
// @author       invobzvr
// @match        *://www.bilibili.com/video/*
// @grant        none
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/bilivideo
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    let vue, ct, el,
        app = document.querySelector('#app');
    Object.defineProperty(app, '__vue__', {
        get: () => vue,
        set: val => {
            if (!(vue = val)) {
                return;
            }
            if (vue.currentCidTitle && ct != vue.currentCidTitle) {
                !el && (el = document.querySelector('.video-title').insertAdjacentElement('afterend', document.createElement('div'))).classList.add('video-data');
                el.textContent = ct = vue.currentCidTitle;
            }
        }
    });
})();