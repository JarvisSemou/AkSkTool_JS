import { HttpMethod, AkSkTool } from "../main/AkSkTool.js"


AkSkTool.genUrlPathSync(
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

AkSkTool.genUrlPath(
    HttpMethod.GET,
    "http://www.example.com",
    "/login",
    "aaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
    new Map(),
    // for debug
    // "2022-11-03T23:39:35Z",
    // "Dk6HEzcqSch1lY9%2BFW0H8bRGGtA%3D"
).then(result => {
    console.info(result)
}).catch(err => {
    console.error(err)
})

