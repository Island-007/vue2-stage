class Observer {
    constructor(data) {
        this.walk(data)
    }
    walk(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
}

export function defineReactive(target, key, value) {
    Object.defineProperty(target, key, {
        set(newValue) {
            console.log('设置值')
            if (newValue === value) return
            value = newValue
        },
        get() {
            console.log('取值')
            return value
        }
    })
}
export function observe(data) {
    if (typeof data !== 'object' || data === null) {
        return //只对对象进行劫持
    }

    // 如果一个对象被劫持了，那就不需要再被劫持了（这里创建一个实例用来判断对象是否被劫持过）
    return new Observer(data)
}