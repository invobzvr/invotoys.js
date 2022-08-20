# [Hook.js](https://github.com/invobzvr/invotoys.js/tree/main/hook.js)

### Description
Javascript function hook

### Example
```js
fetch.hook(function (args) {
    if (args[0].endsWith('/log')) {
        return new Response('{"error":0,"data":"ok"}');
    }
});
```
```js
History.prototype.pushState.hook({
    scope: History.prototype,
    before: function (args) {
        dispatchEvent(new CustomEvent('pushstate', { detail: args[2] }));
    },
});
```
