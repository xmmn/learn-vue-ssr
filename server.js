const express = require('express')
const fs = require('fs')
const setupDevServer = require('./build/setup-dev-server')
const { createBundleRenderer } = require('vue-server-renderer')
const isProd = process.env.NODE_ENV === 'production'
// 创建服务
const server = express()
let renderer
let onReady
if (isProd) {
    console.log(1)
    const serverBundle = require('./dist/vue-ssr-server-bundle.json')
    const template = fs.readFileSync('./index.template.html', 'utf-8')
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    renderer = createBundleRenderer(serverBundle, {
        template,
        clientManifest
    })
} else {
    onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
        renderer = createBundleRenderer(serverBundle, {
            template,
            clientManifest
        })
    })
}

server.use('/dist', express.static('./dist'))

async function render(request, response) {
    try {
        // 支持中文
        response.setHeader('Content-type', 'text/html;charset=utf-8')
        const html = await renderer.renderToString({
            url: request.url,
        })
        response.end(html)
    } catch (e) {
        console.log(e)
        response.status(500).end('Internal Server Error')
    }
}

server.get('*', isProd ?
    render :
    async (req, res) => {
        // 开发模式下，需要等待构建完成之后再执行
        await onReady
        render(req, res)
    })

// 启动服务
server.listen(3000, () => {
    console.log('server running at port 3000.')
})
