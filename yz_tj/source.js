// ==UserScript==
// @name         Custom yz_tj
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  研招网调剂增强
// @author       invobzvr
// @match        *://yz.chsi.com.cn/sytj/tj/qecx.html*
// @grant        unsafeWindow
// @license      GPL-3.0
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/yz_tj
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// ==/UserScript==

(function () {
    const ORI_AJAX = $.ajax;
    const ORI_ALERT = layer.alert;

    // 修改查询大小
    unsafeWindow.page_size = 100;
    unsafeWindow.template_zytb_add = function template_zytb_add(id) {
        if (zy_status.cur_num >= zy_status.max_num) {
            var sysName = mark.pageid, msg = "tj_qe_list" == sysName ? "调剂志愿" : "调剂意向";
            layer.alert("您填报的" + msg + '已达上限 <strong class="color-blue">' + zy_status.max_num + "</strong> 个，不可继续填报！", {
                title: "提示"
            });
        } else {
            // 以新窗口方式打开
            open(`tbtjzy.html?zy_type=1&id=${id}`);
        }
    }

    $.ajax = function (args) {
        if (args.url == '/sytj/stu/sytjqexxcx.action') {
            let ORI_SUCCESS = args.success;
            args.success = function (callbackdata) {
                let list = callbackdata.data.vo_list.vos;
                // 过滤无用信息，以时间排序
                callbackdata.data.vo_list.vos = list.filter(ii => !ii.sfmzjybyq && !ii.sfmzyq).sort((a, b) => a.gxsj - b.gxsj);
                ORI_SUCCESS(callbackdata);
            }
        }
        ORI_AJAX(args);
    }

    layer.alert = function (msg, args) {
        // 允许点击空白处关闭layer
        args.shadeClose = true;
        ORI_ALERT(msg, args);
    }

    // 默认查询库
    let idx = 0, lst = [];
    let iid = setInterval(() => {
        if ($('#page_size').length) {
            clearInterval(iid);
            // 切换到模糊搜索
            change_seach('', 'fuzzy', new Event('click'));
            // 全日制模式
            $('#xxfs').val(1);
            if (lst.length) {
                $('#dwxx').val(lst[idx]);
                $('#dwxx').dblclick(function () { this.value = lst[++idx % lst.length] });
            }
        }
    }, 200);
})();