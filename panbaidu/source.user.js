// ==UserScript==
// @name         Custom panbaidu
// @namespace    https://github.com/invobzvr
// @version      0.2
// @description
// @author       invobzvr
// @match        *://pan.baidu.com/*
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://greasyfork.org/scripts/443030-hook-js/code/Hookjs.js
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/panbaidu
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    // Cookie BDCLND

    function inithook() {
        String.prototype.replace.hook({
            scope: String.prototype,
            before: function () {
                if ([...arguments].join() == '/\\w/g,*') {
                    return this;
                }
            }
        });

        XMLHttpRequest.prototype.open.hook({
            scope: XMLHttpRequest.prototype,
            before: function () {
                if (arguments[1].includes('/share/verify') && !sup) {
                    this.addEventListener('readystatechange', () => {
                        if (this.readyState !== 4) {
                            return;
                        }
                        let ret = JSON.parse(this.responseText),
                            randsk = ret.randsk;
                        randsk && GM_setValue(surl, {
                            pwd: ac.value,
                            randsk: randsk,
                        });
                    });
                }
            }
        });
    }

    let surl, sup,
        href = new URL(location.href),
        ac = document.querySelector('#accessCode');
    if (href.pathname === '/share/init') {
        inithook();
        surl = href.searchParams.get('surl');
        ac.autocomplete = 'off';
    } else if (href.pathname.startsWith('/s/1')) {
        surl = href.pathname.substr(4)
    }
    sup = GM_getValue(surl);
    if (sup) {
        if (ac) {
            ac.value = sup.pwd;
            document.querySelector('#submitBtn').click();
        } else if (!sup.fn) {
            sup.fn = unsafeWindow.metaData.FILENAME;
            GM_setValue(surl, sup);
        }
    }
})();