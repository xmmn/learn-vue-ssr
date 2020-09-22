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