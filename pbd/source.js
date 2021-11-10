// ==UserScript==
// @name         Custom pbd
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description
// @author       invobzvr
// @match        *://pan.baidu.com/*
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @homepageURL  https://github.com/invobzvr/tmjs.toys
// @supportURL   https://github.com/invobzvr/tmjs.toys/issues
// @license      GPL-3.0
// ==/UserScript==

(function() {
    // Cookie BDCLND

    const ORI = {
            STR_REPLACE: String.prototype.replace,
            XHR_OPEN: XMLHttpRequest.prototype.open,
        },
        HOOK = {
            STR_REPLACE: function() {
                if ([...arguments].join() == '/\\w/g,*') {
                    return this;
                }
                return ORI.STR_REPLACE.apply(this, arguments);
            },
            XHR_OPEN: function() {
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
                return ORI.XHR_OPEN.apply(this, arguments);
            },
        };

    let surl, sup,
        href = new URL(location.href),
        ac = document.querySelector('#accessCode');
    if (href.pathname === '/share/init') {
        String.prototype.replace = HOOK.STR_REPLACE;
        XMLHttpRequest.prototype.open = HOOK.XHR_OPEN;
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