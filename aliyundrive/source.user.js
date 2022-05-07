// ==UserScript==
// @name         Custom aliyundrive
// @name:zh      Custom aliyundrive
// @namespace    https://github.com/invobzvr
// @version      1.12
// @description  阿里云直链导出
// @author       invobzvr
// @match        *://www.aliyundrive.com/drive*
// @match        *://www.aliyundrive.com/s/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @connect      *
// @require      https://greasyfork.org/scripts/443030-hook-js/code/Hookjs.js?version=1037826
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/aliyundrive
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    const that = {
        a2config: GM_getValue('a2config', {
            host: '127.0.0.1',
            port: 6800,
            dir: 'Download',
        }),
        xhr: function (details) {
            return new Promise((res, rej) => {
                GM_xmlhttpRequest(Object.assign(details, {
                    onerror: rej,
                    onload: res,
                }));
            });
        },
        wait: function (selectors, key) {
            return new Promise(res => {
                let el = document.querySelector(selectors),
                    iid = setInterval(() => (el ? true : el = document.querySelector(selectors)) && (key ? el[key] : true) && (clearInterval(iid), res(el)), 100);
            });
        },
        install: async function () {
            GM_addStyle(`.that-backdrop {
    background: #0006;
    bottom: 0;
    display: grid;
    left: 0;
    overflow: auto;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 200;
}
.that-modal {
    align-self: center;
    background: #fff;
    border-radius: 5px;
    justify-self: center;
    margin: 20px;
    padding: 0 30px;
    user-select: none;
}
.that-title {
    font-size: 30px;
    padding: 20px;
    text-align: center;
}
.that-input-group {
    display: table;
    margin-bottom: 10px;
}
.that-label {
    display: table-cell;
    font-size: 16px;
    padding: 0 10px;
    text-align: center;
    width: 100%;
}
.that-input {
    font-size: 20px;
    padding: 5px 9px;
}
.that-input[type=checkbox] {
    vertical-align: middle;
}
.that-options {
    margin: auto;
    width: 80%;
}
.that-option-item {
    margin-left: 12px;
    white-space: nowrap;
}
.that-option-item .that-label {
    font-size: 13px;
    padding: 0 0 0 3px;
}
.that-actions {
    margin: 20px;
    text-align: center;
}
.that-button {
    background: #09f;
    border-radius: 5px;
    border: none;
    color: #fff;
    padding: 7px 18px;
}
.that-toastbox {
    display: grid;
    min-width: 360px;
    padding: 10px;
    position: fixed;
    right: 0;
    top: 0;
    width: 30%;
    z-index: 201;
}
.that-toast-item {
    background: #09f;
    border-radius: 7px;
    box-shadow: 0 2px 10px #0005;
    color: #fff;
    margin-bottom: 10px;
    padding: 10px 10px 15px 10px;
    opacity: 0;
    transition: .2s;
    transform: scale(.8);
}
.that-toast-item.in {
    opacity: 1;
    transform: scale(1);
}
.that-toast-item.success {
    background: #00a65a;
}
.that-toast-item.info {
    background: #ffa150;
}
.that-toast-item.error {
    background: #dd4b39;
}
.that-toast-item .that-title,
.that-toast-item .that-label {
    padding: 0 10px;
    text-align: left;
    word-break: break-word;
}`);
            that.inithook();
            addEventListener('pushstate', that.onPushState);
            that.rk = `__reactFiber$${Object.keys(await that.wait('#root', '_reactRootContainer')).find(ii => ii.startsWith('__reactContainer$')).split('$')[1]}`;
            that.tbwmo = new MutationObserver(that.tbwmc);
            that.ddmmo = new MutationObserver(that.ddmmc);
            that.ddmmo.observe(document.body, { childList: true });
            that.mmmo = new MutationObserver(that.mmmc);
            that.init();
        },
        inithook: function () {
            History.prototype.pushState.hook({
                scope: History.prototype,
                before: function () {
                    dispatchEvent(new CustomEvent('pushstate', { detail: arguments[2] }));
                },
            });
        },
        init: async function () {
            that.listModel = (await that.wait('[class*=node-list--]'))[that.rk].return.memoizedProps.listModel;
            that.tbwmo.observe(document.querySelector('[class*=page-content--]'), { childList: true });
        },
        tbwmc: function ([mr]) {
            if (mr.addedNodes.length && (that.tbwel = mr.addedNodes[0].querySelector('[class*=toolbar-wrapper]'))) {
                let btn = that.tbwel.firstChild;
                that.tbwel.insertAdjacentHTML('afterbegin', '<div style="background:#fff;height:30px;margin-left:8px;width:.1px"></div>');
                let dlBtn = that.tbwel.insertAdjacentElement('afterbegin', btn.cloneNode(true)),
                    a2Btn = that.tbwel.insertAdjacentElement('afterbegin', btn.cloneNode(true));
                dlBtn.title = 'Download';
                dlBtn.addEventListener('click', () => that.download(that.listModel.selectedItems, that.normal));
                a2Btn.title = 'Aria2';
                a2Btn.addEventListener('click', () => that.download(that.listModel.selectedItems, that.aria2, () => [...that.listModel.selectedIds].forEach(that.listModel.removeSelect)));
                a2Btn.addEventListener('contextmenu', evt => (evt.preventDefault(), that.configa2(true)));
            }
        },
        ddmmc: function ([mr]) {
            let ddm = mr.addedNodes.length && mr.addedNodes[0].querySelector('[class*=dropdown-menu--]');
            ddm && that.listModel && that.mmmo.observe(ddm, { attributes: true, attributeFilter: ['class'] });
        },
        mmmc: function ([mr]) {
            let el = mr.target;
            if (el.className.includes('-prepare')) {
                let props = el[that.rk].child.memoizedProps,
                    list = location.pathname.startsWith('/s/') ? [props.model] : props.fileModel ? [props.fileModel] : props.fileListModel ? props.fileListModel.selectedItems : null;
                if (!list) {
                    return;
                }
                let dlBtn, a2Btn,
                    ul = el.firstChild;
                if (!el.querySelector('[custom]')) {
                    let btn = ul.firstChild;
                    ul.insertAdjacentHTML('afterbegin', '<li class="ant-dropdown-menu-item-divider" custom></li>');
                    dlBtn = ul.insertAdjacentElement('afterbegin', btn.cloneNode(true));
                    dlBtn.setAttribute('custom', 'normal')
                    dlBtn.querySelector('[class*=menu-name--]').innerText = 'Download';
                    a2Btn = ul.insertAdjacentElement('afterbegin', btn.cloneNode(true));
                    a2Btn.setAttribute('custom', 'aria2')
                    a2Btn.querySelector('[class*=menu-name--]').innerText = 'Aria2';
                } else {
                    dlBtn = ul.querySelector('[custom=normal]');
                    a2Btn = ul.querySelector('[custom=aria2]');
                }
                dlBtn.onclick = () => (that.closeMenu(), that.download(list, that.normal));
                a2Btn.onclick = () => (that.closeMenu(), that.download(list, that.aria2));
                a2Btn.oncontextmenu = evt => (evt.preventDefault(), evt.stopPropagation(), that.closeMenu(), that.configa2(true));
            }
        },
        closeMenu: function () {
            setTimeout(() => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
        },
        onPushState: function (evt) {
            if (evt.detail === '/drive/' || evt.detail.startsWith('/drive/folder')) {
                !that.listModel && that.init();
            } else {
                that.listModel = null;
                that.tbwmo.disconnect();
            }
        },
        download: async function (list, func, callback) {
            list.length !== (list = list.filter(ii => ii.type == 'file')).length && that.toast({
                type: 'info',
                title: 'Folders are skipped',
                timer: 1e3,
            });
            list.length && (await func(list), callback && callback());
        },
        normal: async function (list) {
            if (list.length === 1) {
                location.href = await that.urlOf(list[0]);
            } else {
                let ctnr = that.modal('that-backdrop', `<div class="that-modal" style="width:50%">
    <div class="that-title">Urls</div>
    <textarea style="height:${window.innerHeight * .5}px;width:100%;white-space:nowrap"></textarea>
    <div class="that-actions">
        <button class="that-button">OK</button>
    </div>
</div>`);
                ctnr.querySelector('textarea').value = (await Promise.all(list.map(ii => that.urlOf(ii)))).join('\n');
                ctnr.onclick = evt => ['that-backdrop', 'that-button'].includes(evt.target.className) && ctnr.remove();
            }
        },
        aria2: async function (list) {
            let a2config;
            if (!that.a2config.remember) {
                let ret = await that.configa2();
                if (ret) {
                    a2config = ret;
                } else {
                    return that.toast({
                        type: 'info',
                        title: 'Canceled',
                    });
                }
            }
            !a2config && (a2config = that.a2config);
            let data = {
                id: 'INVOTOYS',
                jsonrpc: '2.0',
                method: 'system.multicall',
                params: [await Promise.all(list.map(async ii => ({
                    methodName: 'aria2.addUri',
                    params: [[await that.urlOf(ii)], {
                        dir: a2config.dir,
                        out: ii.name,
                        referer: 'https://www.aliyundrive.com/',
                        'user-agent': navigator.userAgent,
                    }],
                })))],
            };
            if (a2config.token) {
                let token = `token:${a2config.token}`;
                data.params[0].forEach(ii => ii.params.unshift(token));
            }
            let res = await that.xhr({
                method: 'post',
                responseType: 'json',
                url: `http${a2config.https ? 's' : ''}://${a2config.host}:${a2config.port}/jsonrpc`,
                data: JSON.stringify(data),
            }).catch(err => err);
            that.toast(res.status == 200 ? {
                type: 'success',
                title: 'Sent successfully',
            } : {
                type: 'error',
                title: 'Failed to connect to Aria2',
                text: res.error,
            });
        },
        urlOf: async function (model) {
            return model.downloadUrl || model.url || await model.getDownloadUrl();
        },
        configa2: async function (save) {
            let ret = await new Promise(res => {
                let ctnr = that.modal('that-backdrop', `<div class="that-modal">
    <div class="that-title">Aria2 Config</div>
    <form>
        <div class="that-input-group"><span class="that-label">Host</span><input class="that-input" name="host" value="${that.a2config.host}"></div>
        <div class="that-input-group"><span class="that-label">Port</span><input class="that-input" name="port" value="${that.a2config.port}"></div>
        <div class="that-input-group"><span class="that-label">Dir</span><input class="that-input" name="dir" value="${that.a2config.dir}"></div>
        <div class="that-input-group"><span class="that-label">Token</span><input class="that-input" name="token" value="${that.a2config.token || ''}"></div>
        <div class="that-options">
            <label class="that-option-item"><input class="that-input" name="https" type="checkbox"${that.a2config.https ? ' checked' : ''}><span class="that-label">Https</span></label>
            <label class="that-option-item"><input class="that-input" name="remember" type="checkbox"${that.a2config.remember ? ' checked' : ''}><span class="that-label">Remember</span></label>
        </div>
    </form>
    <div class="that-actions">
        <button class="that-button">OK</button>
    </div>
</div>`);
                ctnr.onclick = evt => {
                    switch (evt.target.className) {
                        case 'that-backdrop':
                            ctnr.remove();
                            res();
                            break;
                        case 'that-button':
                            ctnr.remove();
                            res(Object.fromEntries(new FormData(ctnr.querySelector('form'))));
                            break;
                    }
                }
            });
            ret && (save || ret.remember) && GM_setValue('a2config', that.a2config = ret);
            return ret;
        },
        modal: function (ctnrName, innerHTML) {
            let ctnr = document.querySelector(`.${ctnrName}`);
            if (!ctnr) {
                ctnr = document.body.appendChild(document.createElement('div'));
                ctnr.className = ctnrName;
            }
            ctnr[innerHTML instanceof Element ? 'insertAdjacentElement' : 'insertAdjacentHTML']('beforeend', innerHTML);
            return ctnr;
        },
        toast: function (options) {
            let tst = document.createElement('div'),
                ctnr = that.modal('that-toastbox', tst);
            tst.className = `that-toast-item ${options.type || ''}`;
            tst.innerHTML = `<div class="that-title">${options.title || ''}</div><div class="that-label">${options.text || ''}</div>`;
            setTimeout(() => tst.classList.add('in'), 10);
            options.time !== null && setTimeout(() => {
                tst.classList.remove('in');
                tst.addEventListener('transitionend', () => (tst.remove(), !ctnr.childElementCount && ctnr.remove()));
            }, options.time || 3e3);
        },
    };

    that.install();
})();