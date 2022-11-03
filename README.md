# AkSkTool_JS

 http interface ak sk authenticate tool for clink2

latest version : 1.0.0

## install

yarn

```shell
yarn add aksk_tool_js
```

npm

```shell
npm install aksk_tool_js
```

## usage

1.import

```javascript
import { HttpMethod,AkSkTool } from "aksk_tool_js"
```

2.generated clink2 authentication params

```javascript
AkSkTool.genUrlPath(
    HttpMethod.GET,                         // http method
    "http://www.example.com",               // base url
    "/login",                               // url path
    "aaaaaaaaaaaaaaa",                      // AccessKeyId
    "bbbbbbbbbbbbbbbbbbbbbbbbbbb",          // AccessKeySecret
    new Map(),                              // url param
    // 86400,                               // signature exiptes time, default are 1 day
    // --- for debug ---
    // "2022-11-03T23:39:35Z",              // timestamp that use to set into the url, just use when debuging
    // "Dk6HEzcqSch1lY9%2BFW0H8bRGGtA%3D"   // signature that will finaly set into the generated url path
).then(result => {
    /**
    result object content (结果对象)

    {
        // source path (原始传入的接口路径)
        srcPath: '/login',

        // gennerated url path that will use to request http server (生成的接口路径,用于 http 请求)
        finalPath: '/login?AccessKeyId=aaaaaaaaaaaaaaa&Expires=86400&Timestamp=2022-11-03T23%3A39%3A35Z&Signature=Dk6HEzcqSch1lY9%2BFW0H8bRGGtA%3D',

        // signature expires time (签名有效时间)
        expires: 86400,

        // current timestamp (当前使用的时间戳)
        timestamp: '2022-11-03T23:39:35Z',

        // current signature (当前使用的签名)
        signature: 'Dk6HEzcqSch1lY9%2BFW0H8bRGGtA%3D'
    }

    */

    console.info(result)
}).catch(err => {
    console.error(err)
})
```

or  

```javascript
let result = AkSkTool.genUrlPathSync(
    HttpMethod.GET,
    "http://www.example.com",
    "/login",
    "aaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
    new Map(),
    // for debug
    // "2022-11-03T23:39:35Z",
    // "Dk6HEzcqSch1lY9%2BFW0H8bRGGtA%3D"
)
```