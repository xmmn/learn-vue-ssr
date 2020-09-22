import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router/index'
import { createStore } from './store'
import VueMeta from 'vue-meta'
Vue.use(VueMeta)

// 导出创建app的工具函数，防止服务端多实例之间相互影响。
export function createApp() {
    const router = createRouter()
    const store = createStore()
    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return { app, router, store }
}