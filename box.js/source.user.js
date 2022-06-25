// ==UserScript==
// @name         Box.js
// @namespace    https://github.com/invobzvr
// @version      0.1
// @description  Box for modal
// @author       invobzvr
// @homepageURL  https://github.com/invobzvr/invotoys.js/tree/main/box.js
// @supportURL   https://github.com/invobzvr/invotoys.js/issues
// @license      GPL-3.0
// ==/UserScript==

const LIB_NAME = 'Box';
!function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ?
        module.exports = factory() :
        typeof define === 'function' && define.amd ?
            define(factory) :
            (global = global || self)[LIB_NAME] = factory();
}(this, function () {
    'use strict';
    function element(tag, props, body) {
        let el = document.createElement(tag);
        props && Object.entries(props).forEach(([key, val]) => val && (el[key] = val));
        body && body instanceof HTMLElement ? body.append(el) : typeof body === 'string' && document.querySelector(body).append(el);
        return el;
    }

    class Box {
        constructor(params) {
            this.params = params;
            this.build();
            this.register();
            this.await = new Promise(resolve => this.resolve = resolve);
        }

        close(val) {
            this.ctnr.remove();
            this.resolve(val);
        }

        build() {
            this.ctnr = element('div', { className: 'box-backdrop' }, document.body);
            this.modal = element('div', { className: 'box-modal' }, this.ctnr);
            element('div', {
                className: 'box-title',
                innerText: this.params.title,
            }, this.modal);
            element('div', {
                className: 'box-content',
                innerText: this.params.text,
                innerHTML: this.params.html,
            }, this.modal);
            let actions = element('div', { className: 'box-actions' }, this.modal);
            Object.entries(this.params.actions || { OK: () => this.close() }).forEach(([key, val]) => element('button', {
                className: 'box-button',
                innerText: key,
                onclick: () => this.close(val(this.modal)),
            }, actions));
        }

        register() {
            let ignore = false;
            this.modal.addEventListener('mousedown', () => {
                this.ctnr.addEventListener('mouseup', evt => evt.target === this.ctnr && (ignore = true), { once: true });
            });
            this.ctnr.addEventListener('mousedown', () => {
                this.ctnr.addEventListener('mouseup', evt => (evt.target === this.modal || this.modal.contains(evt.target)) && (ignore = true), { once: true });
            });
            this.ctnr.addEventListener('click', evt => {
                ignore ? ignore = false : evt.target === this.ctnr && this.close();
            });
        }

        then(onFulfilled) {
            return this.await.then(onFulfilled);
        }
    }

    element('style', null, document.head).innerHTML = `.box-backdrop {
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

.box-modal {
    align-self: center;
    background: #fff;
    border-radius: 5px;
    justify-self: center;
    margin: 20px;
    padding: 0 30px;
    user-select: none;
}

.box-title {
    font-size: 30px;
    padding: 20px;
    text-align: center;
}

.box-input-group {
    display: table;
    margin-bottom: 10px;
}

.box-label {
    display: table-cell;
    font-size: 16px;
    padding: 0 10px;
    text-align: center;
    width: 100%;
}

.box-input {
    font-size: 20px;
    padding: 5px 9px;
}

.box-input[type=checkbox] {
    vertical-align: middle;
}

.box-options {
    margin: auto;
    width: 80%;
}

.box-option-item {
    margin-right: 12px;
    white-space: nowrap;
}

.box-option-item .box-label {
    font-size: 13px;
    padding: 0 0 0 3px;
}

.box-actions {
    margin: 20px;
    text-align: center;
}

.box-button {
    background: #09f;
    border-radius: 5px;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    margin: 5px;
    padding: 10px 18px;
}`;

    return Box;
});
