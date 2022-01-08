// ==UserScript==
// @name         Custom aliyundrive
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  阿里云直链导出
// @author       invobzvr
// @match        *://www.aliyundrive.com/drive/*
// @grant        GM_addStyle
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/aliyundrive
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    const that = {
        init: async function () {
            XMLHttpRequest.prototype.open = that.HOOK.XHR_OPEN;
            await new Promise(resolve => {
                let root = document.querySelector('#root'),
                    iid = setInterval(() => root._reactRootContainer && (clearInterval(iid), resolve()), 100);
            });
            let menu = document.querySelector('ul[class^=nav-menu]'),
                btn = menu.firstChild.cloneNode(true);
            btn.className = menu.lastChild.className;
            btn.lastChild.innerText = 'Export';
            btn.addEventListener('click', that.click);
            menu.insertAdjacentHTML('beforeend', `<hr>${document.querySelector('[class^=divider]').outerHTML}<hr>`);
            menu.insertAdjacentElement('beforeend', btn);
            GM_addStyle(`.export-main {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 0px 20px #0002;
    height: 80%;
    left: 50%;
    overflow: auto;
    padding: 20px;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    z-index: 999999;
}
.export-main a {
    display: block;
`);
        },
        export: function () {
            that.main = document.createElement('div');
            that.main.className = 'export-main';
            that.main.innerHTML = that.data.filter(ii => ii.type === 'file').map(ii => `<a href="${ii.download_url}" download>${ii.name}</a>`).join('');
            that.main.addEventListener('mousedown', evt => evt.stopPropagation());
            document.body.append(that.main);
        },
        click: function () {
            if (that.main) {
                that.main = that.main.remove();
            } else {
                that.export();
            }
        },
        ORI: {
            XHR_OPEN: XMLHttpRequest.prototype.open,
        },
        HOOK: {
            XHR_OPEN: function () {
                if (arguments[1].endsWith('/file/list')) {
                    this.addEventListener('readystatechange', () => {
                        if (this.readyState === 4) {
                            that.data = JSON.parse(this.responseText).items;
                        }
                    });
                }
                return that.ORI.XHR_OPEN.apply(this, arguments);
            },
        },
    };

    that.init();
})();