// ==UserScript==
// @name         Custom aliyundrive
// @name:zh      Custom aliyundrive
// @namespace    https://github.com/invobzvr
// @version      1.8
// @description  阿里云直链导出
// @author       invobzvr
// @match        *://www.aliyundrive.com/drive*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require      https://greasyfork.org/scripts/443030-hook-js/code/Hookjs.js?version=1037826
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/aliyundrive
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    const Toast = Swal.mixin({
        position: 'top-end',
        showConfirmButton: false,
        timer: 3e3,
        timerProgressBar: true,
        toast: true,
        didOpen: tst => {
            tst.addEventListener('mouseenter', Swal.stopTimer);
            tst.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

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
                    list = props.fileModel ? [props.fileModel] : props.fileListModel ? props.fileListModel.selectedItems : null;
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
            list.length !== (list = list.filter(ii => ii.type == 'file')).length && await Toast.fire({
                icon: 'warning',
                title: 'Folders are skipped',
                timer: 1e3,
            });
            list.length && (await func(list), callback && callback());
        },
        normal: function (list) {
            if (list.length === 1) {
                location.href = that.urlOf(list[0]);
            } else {
                Swal.fire({
                    title: 'Urls',
                    input: 'textarea',
                    inputValue: list.map(ii => that.urlOf(ii)).join('\n'),
                    inputAttributes: {
                        style: `height:${window.innerHeight * .5}px;white-space:nowrap`,
                    },
                    width: '60%',
                });
            }
        },
        aria2: async function (list) {
            let a2config;
            if (!that.a2config.remember) {
                let ret = await that.configa2();
                if (ret.isConfirmed) {
                    a2config = ret.value;
                } else {
                    return Toast.fire({
                        icon: 'info',
                        title: 'Canceled',
                    });
                }
            }
            !a2config && (a2config = that.a2config);
            let data = {
                id: 'INVOTOYS',
                jsonrpc: '2.0',
                method: 'system.multicall',
                params: [list.map(ii => ({
                    methodName: 'aria2.addUri',
                    params: [[that.urlOf(ii)], {
                        dir: a2config.dir,
                        out: ii.name,
                        referer: 'https://www.aliyundrive.com/',
                        'user-agent': navigator.userAgent,
                    }],
                }))],
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
            Toast.fire(res.status == 200 ? {
                icon: 'success',
                title: 'Sent successfully',
            } : {
                icon: 'error',
                title: 'Failed to connect to Aria2',
                text: res.error || '',
            });
        },
        urlOf: function (model) {
            return model.downloadUrl || model.url;
        },
        configa2: async function (save) {
            let ret = await Swal.fire({
                title: 'Aria2 Config',
                html: `<form>
    <div><span>Host</span><input class="swal2-input" name="host" value="${that.a2config.host}"></div>
    <div><span>Port</span><input class="swal2-input" name="port" value="${that.a2config.port}"></div>
    <div><span>Dir</span><input class="swal2-input" name="dir" value="${that.a2config.dir}"></div>
    <div><span>Token</span><input class="swal2-input" name="token" value="${that.a2config.token || ''}"></div>
    <div>
        <label><span>Https</span><input name="https" type="checkbox"${that.a2config.https ? ' checked' : ''}></label>\u3000
        <label><span>Remember</span><input name="remember" type="checkbox"${that.a2config.remember ? ' checked' : ''}></label>
    </div>
</form>`,
                preConfirm: () => Object.fromEntries(new FormData(Swal.getHtmlContainer().firstChild)),
            });
            ret.isConfirmed && (save || ret.value.remember) && GM_setValue('a2config', that.a2config = ret.value);
            return ret;
        },
    };

    that.install();
})();