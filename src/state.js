import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options;

  if (opts.data) {
    initData(vm);
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    set(newValue) {
      vm[target][key] = newValue;
    },
    get() {
      return vm[target][key];
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  vm._data = data;
  // 对数据进行劫持（Vue2 defineProperty）
  observe(data);
  // 把data数据代理到vm上
  for (let key in data) {
    proxy(vm, "_data", key);
  }
}
