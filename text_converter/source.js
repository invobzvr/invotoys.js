// ==UserScript==
// @name         Text Converter
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  Convert selected text to HTML Element
// @author       invobzvr
// @match        *://*/*
// @grant        GM_addStyle
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/text_converter
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
    const SLCN = window.getSelection(),
        EL_TYPE = {
            Image: 'img',
            Video: 'video',
            Link: 'a',
        };
    let ctnr, rng;
    addEventListener('mousedown', () => ctnr && (ctnr = ctnr.remove()));
    addEventListener('mouseup', evt => {
        const range = SLCN.getRangeAt(0);
        if (rng === range) {
            return;
        }
        const text = (rng = range).toString();
        if (!text) {
            return;
        }
        ctnr = document.body.insertAdjacentElement('beforeend', document.createElement('div'));
        ctnr.className = 'tc_ctnr';
        ctnr.style = `top:${evt.pageY + 10}px;left:${evt.pageX}px`;
        ctnr.onmousedown = ctnr.onmouseup = evt => evt.stopPropagation();
        ctnr.onclick = evt => {
            let el = document.createElement(EL_TYPE[evt.target.innerText]);
            switch (evt.target.innerText) {
                case 'Image':
                case 'Video':
                    el.src = text;
                    break;
                case 'Link':
                    el.target = '_blank';
                    el.href = text;
                    break;
            }
            rng.surroundContents(el);
            rng.collapse();
            ctnr && (ctnr = ctnr.remove());
        }
        ctnr.innerHTML = `<div>Image</div><div>Video</div><div>Link</div>`;
    });

    GM_addStyle(`.tc_ctnr {
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px #0009;
    font-size: 12px;
    position: absolute;
    user-select: none;
}
.tc_ctnr>div {
    padding: 3px 5px;
    transition: .2s;
}
.tc_ctnr>div:hover {
    background: #0002;
}
.tc_ctnr>div:not(:last-child) {
    border-bottom: 1px solid #0003;
}`);
})();