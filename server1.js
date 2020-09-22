const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
})

// 创建服务
const server = express()
server.use('/dist', express.static('./dist'))

server.get('/', async (request, response) => {
    try {
        // 支持中文
        response.setHeader('Content-type', 'text/html;charset=utf-8')
        const html = await renderer.renderToString({
            title: 'Hello SSR',
            meta: `<meta name="description" content="搭建ssr">`
        })
        response.end(html)
    } catch(e){
        response.status(500).end('Internal Server Error')
    }
})

// 启动服务
server.listen(3000, () => {
    console.log('server running at port 3000.')
})
