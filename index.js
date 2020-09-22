const Vue = require('vue')
const express = require('express')
const { createRenderer } = require('vue-server-renderer')
const { request, response } = require('express')

const app = new Vue({
    template: `<div>Hello World</div>`
})

const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
})

// 创建服务
const server = express()

server.get('*', async (request, response) => {
    try {
        // 支持中文
        response.setHeader('Content-type', 'text/html;charset=utf-8')
        const html = await renderer.renderToString(app, {
            title: 'Hello SSR',
            meta: `<meta name="description" content="搭建ssr">`
        })
        response.end(html)
    } catch{
        response.status(500).end('Internal Server Error')
    }
})

// 启动服务
server.listen(3000)
