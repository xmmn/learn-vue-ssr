const Vue = require('vue')
const express = require('express')
const { createRenderer } = require('vue-server-renderer')
const { request, response } = require('express')

const app = new Vue({
    template: `<div>Hello World</div>`
})
const renderer = createRenderer()
// 创建服务
const server = express()

server.get('*', async (request, response) => {
    try {
        // 支持中文
        response.setHeader('Content-type', 'text/html;charset=utf-8')
        const html = await renderer.renderToString(app)
        response.end(`
            <!DOCTYPE html>
            <html lang="en">
               <head><title>Hello</title></head>
               <body>${html}</body>
            </html>
       `)
    } catch{
        response.status(500).end('Internal Server Error')
    }
})

// 启动服务
server.listen(3000)
