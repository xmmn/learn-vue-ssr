const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')
const resolve = file => path.resolve(__dirname, file)
module.exports = function (server, callback) {
    let ready
    const onReady = new Promise(resolve => ready = resolve)

    let serverBundle
    let clientManifest
    let template

    const update = () => {
        if (template && serverBundle && clientManifest) {
            // 构建完成
            ready()
            callback(serverBundle, template, clientManifest)
        }
    }

    // 监听模版文件变化
    const templatePath = path.resolve(__dirname, '../index.template.html')
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
    chokidar.watch(templatePath).on('change', () => {
        template = fs.readFileSync(templatePath, 'utf-8')
        update()
    })

    // 构建监控
    const serverConfig = require('./webpack.server.config')
    const serverCompiler = webpack(serverConfig)
    const serverDevMiddleware = devMiddleware(serverCompiler, {
        logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
    })

    serverCompiler.hooks.done.tap('server', () => {
        try {
            serverBundle = JSON.parse(
                // 读取内存中的数据
                serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
            )
        } catch (e) {
            console.log(e)
        }
        update()
    })

    const clientConfig = require('./webpack.client.config')
    // 添加HRM plugin
    clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    clientConfig.entry.app = [
        'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新一个客户端脚本
        clientConfig.entry.app
    ]
    clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的 hash
    const clientCompiler = webpack(clientConfig)
    const clientDevMiddleware = devMiddleware(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
    })
    clientCompiler.hooks.done.tap('client', () => {
        clientManifest = JSON.parse(
            clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
        )
        update()
    })

    server.use(hotMiddleware(clientCompiler, {
        log: false // 关闭它本身的日志输出
    }))
    server.use(clientDevMiddleware)

    return onReady
}