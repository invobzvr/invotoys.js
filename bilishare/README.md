# Custom bilishare

### Description
B站(bilibili)大会员共享

### Usage
- 拿到大会员账号的`access_key`
- 播放页面按下<kbd>F12</kbd>, 在`Console`处输入
    ```js
    > access_key = 'VIP_ACCESS_KEY_HERE' // Input
      [access_key] setted
    < "VIP_ACCESS_KEY_HERE" // Output
    >
    ```
    - 将`access_key`置为`null`可删除存储
        ```js
        > access_key = null // Input
          [access_key] deleted
        < null // Output
        >
        ```
