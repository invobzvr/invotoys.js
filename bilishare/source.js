// ==UserScript==
// @name         Custom bilishare
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  B站(bilibili)大会员共享
// @author       invobzvr
// @match        *://www.bilibili.com/bangumi/play/*
// @grant        unsafeWindow
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GPL-3.0
// @homepageURL  https://github.com/invobzvr/tmjs.toys/tree/main/bilishare
// @supportURL   https://github.com/invobzvr/tmjs.toys/issues
// ==/UserScript==

(function () {
    const ORI_XHRO = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function () {
        if (arguments[1].startsWith('https://api.bilibili.com/pgc/player/web/playurl') && access_key) {
            let url = new URL(arguments[1]);
            url.searchParams.append('access_key', access_key);
            arguments[1] = url;
        };
        return ORI_XHRO.apply(this, arguments);
    }

    function proxyIV() {
        return new Promise(resolve => {
            let iid = setInterval(() => {
                if (typeof __INITIAL_STATE__.userState.vipInfo.isVip !== 'undefined') {
                    clearInterval(iid);
                    __INITIAL_STATE__.userState.vipInfo.__defineGetter__('isVip', () => true);
                    resolve();
                }
            }, 100);
        });
    }

    async function init() {
        let ep_id = location.pathname.match('\/play\/ep(\\d+)')[1];
        await proxyIV();
        bangumiCallNext(`${ep_id}.`);
        bangumiCallNext(ep_id);
    }

    let access_key = GM_getValue('access_key');
    access_key && init();
    Object.defineProperty(unsafeWindow, 'access_key', {
        get: () => access_key,
        set: val => {
            if (val) {
                GM_setValue('access_key', val);
                let lak = !access_key;
                access_key = val;
                lak && init();
                console.log('[access_key] setted');
            } else {
                GM_deleteValue('access_key');
                console.log('[access_key] deleted');
            }
        }
    })
})();