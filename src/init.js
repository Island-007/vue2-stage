import { initState } from "./state"
import { compileToFunction } from './compiler/index.js'

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options
        initState(vm)
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)

        // 如果不存在render属性
        if (!options.render) {
            let template = options.template

            if (!template && el) {
                template = el.outerHTML
            }

            // 最终需要把template模板转化为render函数
            if (template) {
                const render = compileToFunction(template)
                options.render = render
            }
        }
    }
}
