// Clink2 ak sk 鉴权工具

import hmacSha1 from 'crypto-js/hmac-sha1.js'
import base64 from 'crypto-js/enc-base64.js'

const LogTag = "Clink2 Authenticate Util"

const N = "\n"

const MaxExpires = 86400

const HttpMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    CONNECT: "CONNECT",
    OPTIONS: "OPTIONS",
    TRACE: "TRACE",
    PATCH: "PATCH",
    HEAD: "HEAD"
}

/** Clink2 鉴权工具 */
const AkSkTool = {

    /**
     * 生成 Clink2 鉴权 url 的方法
     * 
     * @param {HttpMethod} method 大写的 http 方法名
     * @param {String} baseUrl 基础 url
     * @param {String} path 接口路径
     * @param {String} accessKeyId ak id
     * @param {String} secretKey sk(鉴权密钥)
     * @param {Map}    params url 路径参数
     * @param {Number} expires 可选参数, 生成的 url 的签名的有效时间,单位为秒,最小值为 1, 最大值为 86400 (24 小时), 默认为 86400
     * @param {String} timestamp 可选参数, 自定义签名时间戳,格式为 “yyyy-MM-ddTHH:mm:ssZ”,不传则内部实时生成,通常在调试时用来生成指定时间戳的接口路径
     * @param {String} signature 可选参数, 自定义签名接口签名,不传则内部生成,通常在调试时用来生成指定签名的接口路径
     * 
     * @return 返回一个对象,包含生成的结果, 失败则返回 null
     *          {
     *              srcPath,    // 原始传入的接口路径
     *              finalPath,  // 生成的接口路径
     *              expires,    // 签名有效时间
     *              timestamp,  // 签名时间戳,格式为 “yyyy-MM-ddTHH:mm:ssZ”
     *              signature,  // 接口签名
     *          }
     */
    genUrlPathSync(
        method = HttpMethod.GET,
        baseUrl = "",
        path = "/",
        accessKeyId = "",
        secretKey = "",
        params = new Map(),
        expires = MaxExpires,
        timestamp = genCurrentTimestamp(),
        signature,
    ) {
        console.info(`${N
            }${LogTag}${N
            }genUrlPath params${N
            }method: ${method}${N
            }baseUrl: ${baseUrl}${N
            }path: ${path}${N
            }accessKeyId: ${accessKeyId}${N
            }secreKey: ${secretKey}${N
            }params: ${params && (params instanceof Map) && mapToString(params)}${N
            }expires: ${expires}${N
            }timestamp: ${timestamp}${N
            }signature: ${signature}${N}
    `)

        if (!method || !HttpMethod[method]) {
            console.error(genIncorrectErrorMessage('method', method))
            return null
        }

        // 提取域名
        let domain = getDomain(baseUrl)
        if (!domain || domain == "") {
            console.error(genIncorrectErrorMessage('baseUrl', baseUrl))
            return null
        }

        if (!path) {
            console.error(genIncorrectErrorMessage('path', path))
            return null
        }

        if (!accessKeyId) {
            console.error(genIncorrectErrorMessage('accessKeyId', accessKeyId))
            return null
        }

        if (!secretKey) {
            console.error(genIncorrectErrorMessage('secretKey', secretKey))
            return null
        }

        if (!params || !(params instanceof Map)) {
            console.error(genIncorrectErrorMessage('params', JSON.stringify(params), `params must be a Map`))
            return null
        }

        if (!expires ||
            !(typeof expires == 'number') ||
            !(expires >= 1 && expires <= MaxExpires)) {
            console.error(genIncorrectErrorMessage('expires', expires, `expires must greater than 1 and less then ${MaxExpires}`))
            return null
        }

        if (!timestamp ||
            !timestamp.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g)) {
            console.error(genIncorrectErrorMessage('timestamp', timestamp, `timestamp must match 'yyyy-MM-ddTHH:mm:ssZ'`))
            return null
        }

        return genUrlPathInner(
            method,
            domain,
            path,
            accessKeyId,
            secretKey,
            params,
            expires,
            timestamp,
            signature
        )
    },

    /**
     * Promise 风格的生成 Clink2 鉴权 url 的方法
     * 
     * @param {HttpMethod} method 大写的 http 方法名
     * @param {String} baseUrl 基础 url
     * @param {String} path 接口路径
     * @param {String} accessKeyId ak id
     * @param {String} secretKey sk(鉴权密钥)
     * @param {Map}    params url 路径参数
     * @param {Number} expires 可选参数, 生成的 url 的签名的有效时间,单位为秒,最小值为 1, 最大值为 86400 (24 小时), 默认为 86400
     * @param {String} timestamp 可选参数, 自定义签名时间戳,格式为 “yyyy-MM-ddTHH:mm:ssZ”,不传则内部实时生成,通常在调试时用来生成指定时间戳的接口路径
     * @param {String} signature 可选参数, 自定义签名接口签名,不传则内部生成,通常在调试时用来生成指定签名的接口路径
     * 
     * @return 返回一个对象,包含生成的结果
     *          {
     *              srcPath,    // 原始传入的接口路径
     *              finalPath,  // 生成的接口路径
     *              expires,    // 签名有效时间
     *              timestamp,  // 签名时间戳,格式为 “yyyy-MM-ddTHH:mm:ssZ”
     *              signature,  // 接口签名
     *          }
     */
    genUrlPath(
        method = HttpMethod.GET,
        baseUrl = "",
        path = "/",
        accessKeyId = "",
        secretKey = "",
        params = new Map(),
        expires = MaxExpires,
        timestamp = genCurrentTimestamp(),
        signature,
    ) {
        return new Promise((resolve, reject) => {
            console.info(`${N
                }${LogTag}${N
                }genUrlPath params${N
                }method: ${method}${N
                }baseUrl: ${baseUrl}${N
                }path: ${path}${N
                }accessKeyId: ${accessKeyId}${N
                }secreKey: ${secretKey}${N
                }params: ${params && (params instanceof Map) && mapToString(params)}${N
                }expires: ${expires}${N
                }timestamp: ${timestamp}${N
                }signature: ${signature}${N}
            `)

            if (!method || !HttpMethod[method]) reject(genIncorrectErrorMessage('method', method))

            // 提取域名
            let domain = getDomain(baseUrl)
            if (!domain || domain == "") reject(genIncorrectErrorMessage('baseUrl', baseUrl))

            if (!path) reject(genIncorrectErrorMessage('path', path))

            if (!accessKeyId) reject(genIncorrectErrorMessage('accessKeyId', accessKeyId))

            if (!secretKey) reject(genIncorrectErrorMessage('secretKey', secretKey))

            if (!params || !(params instanceof Map)) reject(genIncorrectErrorMessage('params', JSON.stringify(params), `params must be a Map`))

            if (!expires ||
                !(typeof expires == 'number') ||
                !(expires >= 1 && expires <= MaxExpires)) {
                reject(genIncorrectErrorMessage('expires', expires, `expires must greater than 1 and less then ${MaxExpires}`))
            }

            if (!timestamp ||
                !timestamp.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g)) {
                reject(genIncorrectErrorMessage('timestamp', timestamp, `timestamp must match 'yyyy-MM-ddTHH:mm:ssZ'`))
            }

            resolve(genUrlPathInner(
                method,
                domain,
                path,
                accessKeyId,
                secretKey,
                params,
                expires,
                timestamp,
                signature
            ))
        })

    },





}

function genUrlPathInner(
    method,
    domain,
    path,
    accessKeyId,
    secretKey,
    params,
    expires,
    timestamp,
    signature,
) {
    params.set("AccessKeyId", accessKeyId)
    params.set("Expires", expires)
    params.set("Timestamp", timestamp)

    let sortedParam = sortMap(params)
    let urlEncodedParam = encodeParams(sortedParam)
    let pathWithSignture
    let signatureResult
    if ((signature == undefined || signature == null)) {
        let concatedParams = genConcatedUrlParam(urlEncodedParam)
        let signatureContent = method + domain + path + "?" + concatedParams
        signatureResult = encodeURIComponent(base64.stringify(hmacSha1(signatureContent, secretKey)))
        pathWithSignture = path + "?" + concatedParams + "&" + "Signature=" + signatureResult
    } else {
        signatureResult = signature
        urlEncodedParam.set("Signature", signatureResult)
        pathWithSignture = path + "?" + genConcatedUrlParam(urlEncodedParam)
    }

    let result = {
        srcPath: path,
        finalPath: pathWithSignture,
        expires: expires,
        timestamp: timestamp,
        signature: signatureResult
    }

    console.info("result: ", result)

    return result
}


function genConcatedUrlParam(paramMap) {
    let concatedParams = ""
    for (let [key, value] of paramMap) {
        concatedParams += key + "=" + value + "&"
    }
    return concatedParams.substring(0, concatedParams.length - 1)
}

function encodeParams(paramMap) {
    let encodedMap = new Map()
    for (let [key, value] of paramMap) {
        encodedMap.set(encodeURIComponent(key), encodeURIComponent(value))
    }
    return encodedMap
}

function sortMap(srcMap) {
    let keys = []
    let sortedMap = new Map()
    srcMap.forEach((value, key) => { keys.push(key) })
    keys.sort().forEach(key => {
        sortedMap.set(key, srcMap.get(key))
    })
    return sortedMap
}

function mapToString(map) {
    let stringifyMap = "[ "
    map.forEach((value, key) => { stringifyMap += key + ":" + value + " , " })
    stringifyMap += " ]"
    return stringifyMap
}

function genIncorrectErrorMessage(paramName, paramValue, extenMessage = "") {
    return `param ${paramName} '${paramValue}' incorrect. ${extenMessage}`
}

/** 提取 url 中的域名 */
function getDomain(url) {
    return url.split("://")[1]?.split("/")[0]
}

/** 生成实时时间戳 */
function genCurrentTimestamp() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let dayOfMonth = date.getDate()
    let hours = date.getHours()
    let minunes = date.getMinutes()
    let seconds = date.getSeconds()
    return `${year}-${toXXFormatNum(month)}-${toXXFormatNum(dayOfMonth)}T${toXXFormatNum(hours)}:${toXXFormatNum(minunes)}:${toXXFormatNum(seconds)}Z`
}

/** 格式化数值为两位数字 */
function toXXFormatNum(srcNum) {
    return srcNum < 10 ? `0${srcNum}` : srcNum
}

export {
    HttpMethod,
    AkSkTool
}