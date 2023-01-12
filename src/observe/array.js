const oldArrayProperty = Array.prototype;
export const arrayProperty = Object.create(oldArrayProperty)

const methods = ['push','pop','shift','unshift','splice','soft','reverse']

methods.forEach((method) => {
  arrayProperty[method] = function(...args){
    const result = Array.prototype[method].call(this,...args)
    let inserted
    const ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if(inserted) {
      ob.observeArray(inserted)
    }
    return result
  }
})

