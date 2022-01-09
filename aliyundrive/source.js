// ==UserScript==
// @name         Custom aliyundrive
// @namespace    https://github.com/invobzvr
// @version      1.1
// @description  阿里云直链导出
// @author       invobzvr
// @match        *://www.aliyundrive.com/drive/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
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
            history.pushState = that.HOOK.H_PUSHSTATE;
            addEventListener('PUSHSTATE', that.onPushState);
            that.rk = `__reactFiber$${Object.keys(await that.wait('#root', '_reactRootContainer')).find(ii => ii.startsWith('__reactContainer$')).split('$')[1]}`;
            that.tbmo = new MutationObserver(that.tbmc);
            that.init();
        },
        init: async function () {
            that.listModel = (await that.wait('[class^=node-list--]'))[that.rk].return.memoizedProps.listModel;
            that.tbmo.observe(document.querySelector('[class^=page-content--]'), { childList: true });
        },
        tbmc: function ([mr]) {
            if (mr.addedNodes.length && (that.tbel = mr.addedNodes[0].querySelector('[class^=toolbar-wrapper]'))) {
                let btn = that.tbel.firstChild;
                that.tbel.insertAdjacentHTML('afterbegin', '<div style="background:#fff;height:30px;margin-left:8px;width:.1px"></div>');
                let dlBtn = that.tbel.insertAdjacentElement('afterbegin', btn.cloneNode(true)),
                    a2Btn = that.tbel.insertAdjacentElement('afterbegin', btn.cloneNode(true));
                dlBtn.title = 'Download';
                dlBtn.addEventListener('click', that.download);
                a2Btn.title = 'Aria2';
                a2Btn.addEventListener('click', that.aria2);
                a2Btn.addEventListener('contextmenu', evt => (evt.preventDefault(), that.configa2(true)));
            }
        },
        onPushState: function (evt) {
            if (evt.detail === '/drive/' || evt.detail.startsWith('/drive/folder')) {
                !that.listModel && that.init();
            } else {
                that.listModel = null;
                that.tbmo.disconnect();
            }
        },
        download: async function () {
            let selected = that.listModel.selectedItems;
            selected.length !== (selected = selected.filter(ii => ii.type == 'file')).length && await Toast.fire({
                icon: 'warning',
                title: 'Folders are skipped',
            });
            if (selected.length === 1) {
                location.href = selected[0].downloadUrl;
            } else {
                Swal.fire({
                    title: 'Urls',
                    input: 'textarea',
                    inputValue: selected.map(ii => ii.downloadUrl).join('\n'),
                    inputAttributes: {
                        style: `height:${window.innerHeight * .5}px;white-space:nowrap`,
                    },
                    width: '60%',
                });
            }
        },
        aria2: async function () {
            if (!that.a2config.remember) {
                if (!await that.configa2()) {
                    return Toast.fire({
                        icon: 'info',
                        title: 'Canceled',
                    });
                }
            }
            let selected = that.listModel.selectedItems;
            selected.length !== (selected = selected.filter(ii => ii.type == 'file')).length && Toast.fire({
                icon: 'warning',
                title: 'Folders are skipped',
            });
            let res = await that.xhr({
                method: 'post',
                responseType: 'json',
                url: `http://${that.a2config.host}:${that.a2config.port}/jsonrpc`,
                data: JSON.stringify({
                    id: 'INVOTOYS',
                    jsonrpc: '2.0',
                    method: 'system.multicall',
                    params: [selected.map(ii => ({
                        methodName: 'aria2.addUri',
                        params: [[ii.downloadUrl], {
                            dir: that.a2config.dir,
                            referer: 'https://www.aliyundrive.com/',
                            'user-agent': navigator.userAgent,
                        }],
                    }))],
                }),
            }).catch(err => err);
            Toast.fire(res.status == 200 ? ([...that.listModel.selectedIds].forEach(that.listModel.removeSelect), {
                icon: 'success',
                title: 'Sended successfully',
            }) : {
                icon: 'error',
                title: 'Failed to connect to Aria2',
                text: res.error || '',
            });
        },
        configa2: async function (save) {
            let ret = await Swal.fire({
                title: 'Aria2 Config',
                html: `<form>
    <div><span>Host</span><input class="swal2-input" name="host" value="${that.a2config.host}"></div>
    <div><span>Port</span><input class="swal2-input" name="port" value="${that.a2config.port}"></div>
    <div><span>Dir</span><input class="swal2-input" name="dir" value="${that.a2config.dir}"></div>
    <div><label><span>Remember</span><input name="remember" type="checkbox"${that.a2config.remember ? ' checked' : ''}></label></div>
</form>`,
                preConfirm: () => Object.fromEntries(new FormData(Swal.getHtmlContainer().firstChild).entries()),
            });
            ret.isConfirmed && (save || ret.value.remember) && GM_setValue('a2config', that.a2config = ret.value);
            return ret.isConfirmed;
        },
        ORI: {
            H_PUSHSTATE: History.prototype.pushState,
        },
        HOOK: {
            H_PUSHSTATE: function () {
                dispatchEvent(new CustomEvent('PUSHSTATE', { detail: arguments[2] }));
                return that.ORI.H_PUSHSTATE.apply(this, arguments);
            },
        },
    };

    that.install();
})();