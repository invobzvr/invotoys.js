# [Hook.js](https://github.com/invobzvr/invotoys.js/tree/main/hook.js)

### Description
Javascript function hook

### Example
```js
fetch.hook(function () {
    if (arguments[0].endsWith('/log')) {
        return new Response('{"error":0,"data":"ok"}');
    }
});
```
```js
History.prototype.pushState.hook({
    scope: History.prototype,
    before: function () {
        dispatchEvent(new CustomEvent('pushstate', { detail: arguments[2] }));
    },
});
```
