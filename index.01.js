const Vue = require('vue')
const { createRenderer } = require('vue-server-renderer')

const app = new Vue({
    template: `<div>Hello World</div>`
})

const renderer = createRenderer()

renderer.renderToString(app, (err, html) => {
    if (err) throw err
    console.log(html)
})

