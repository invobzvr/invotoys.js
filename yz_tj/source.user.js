// ==UserScript==
// @name         Custom yz_tj
// @namespace    https://github.com/invobzvr
// @version      0.2
// @description  研招网调剂增强
// @author       invobzvr
// @match        *://yz.chsi.com.cn/sytj/tj/qecx.html*
// @grant        unsafeWindow
// @require      https://greasyfork.org/scripts/443030-hook-js/code/Hookjs.js?version=1037826
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/yz_tj
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    unsafeWindow.page_size = 100;

    unsafeWindow.template_zytb_add.hook({
        scope: unsafeWindow,
        before: function (id) {
            if (zy_status.cur_num < zy_status.max_num) {
                open(`tbtjzy.html?zy_type=1&id=${id}`);
                return null;
            }
        }
    });

    XMLHttpRequest.prototype.open.hook({
        scope: XMLHttpRequest.prototype,
        before: function () {
            if (arguments[1].endsWith('/sytj/stu/sytjqexxcx.action')) {
                this.addEventListener('readystatechange', () => {
                    if (this.readyState !== 4) {
                        return;
                    }
                    let ret = JSON.parse(this.responseText);
                    ret.data.vo_list.vos = ret.data.vo_list.vos.filter(ii => !ii.sfmzjybyq && !ii.sfmzyq).sort((a, b) => a.gxsj - b.gxsj);
                    Object.defineProperty(this, 'responseText', { value: JSON.stringify(ret) });
                });
            }
        }
    });

    layer.alert.hook({
        scope: layer,
        before: function () {
            let args = arguments[1];
            if (typeof args === 'object') {
                args.shadeClose = true;
            }
        }
    });
})();