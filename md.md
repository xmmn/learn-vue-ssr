在服务端渲染过程中，只支持beforeCreate和created声明周期，但是服务端渲染不会等待其内部的异步数据访问，并且获取的数据也不是响应式的，所以通常在生命周期中获取数据并更新页面的方式无法在服务端渲染过程中使用。

服务端给出的解决方案就是在服务端渲染期间获取到的数据存储到Vuex中，然后把容器中的数据同步到客户端。

创建store：

```
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)
export const createStore = () => {
    return new Vuex.Store({
        state: {
            posts: [] // 文章列表
        },
        mutations: {
            // 修改容器状态
            setPosts(state, data) {
                state.posts = data
            }
        },
        actions: {
            async getPosts({ commit }) {
                const { data } = await axios({
                    method: 'GET',
                    url: 'https://cnodejs.org/api/v1/topics'
                })
                commit('setPosts', data.data)
            }
        }
    })
}
```

在app.js中引入store：

```
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
```

在组件中引入相应state并添加预定义方法serverPrefetch：

```
computed: {
    ...mapState(['posts'])
  },
  serverPrefetch () {
    return this.getPosts()
  },
  methods: {
    ...mapActions(['getPosts'])
  }
```

在服务端入口文件entry-server.js中为渲染上下文添加：

```
context.rendered = () => {
    // Renderer 会把 context.state 数据对象内联到页面模板中
    // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state
    // 客户端就要把页面中的 window.__INITIAL_STATE__ 拿出来填充到客户端 store 容器中
    context.state = store.state
  }
```

客户端入口entry-client.js中将内联的window.__INITIAL_STATE__数据更新到state中:

```
const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
```