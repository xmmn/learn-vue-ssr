import { createApp } from './app'
export default async context => {
    const { app, store, router } = createApp()
    const meta = app.$meta()
    router.push(context.url)
    context.meta = meta
    console.log(meta)
    // 当路由完全解析之后再执行渲染
    await new Promise(router.onReady.bind(router))

    context.rendered = () => {
        // Renderer 会把 context.state 数据对象内联到页面模板中
        // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state
        // 客户端就要把页面中的 window.__INITIAL_STATE__ 拿出来填充到客户端 store 容器中
        context.state = store.state
    }
    return app
}