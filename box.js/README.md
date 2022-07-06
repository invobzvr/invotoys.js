# [Box.js](https://github.com/invobzvr/invotoys.js/tree/main/box.js)

### Description
Box for `modal`/`toast`

### Example
```js
await new Box({
    title: 'Demo Box',
    html: `<input class="box-input" value="Hello, Box!">`,
    actions: {
        OK: modal => modal.querySelector('input').value, // "Hello, Box!"
        Cancel: () => {}, // undefined
    },
});
```
```js
const Toast = Box.mixin({
    title: 'Demo Toast',
    toast: true,
    time: 3e3,
});

new Toast({ text: 'Hello, Toast!' });
```
