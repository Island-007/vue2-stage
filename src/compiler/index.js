import { parse } from './parse'

export function compileToFunction(template) {
  // 把html代码转成ast语法树  ast用来描述代码本身形成树结构 不仅可以描述html 也能描述css以及js语法
  let ast = parse(template)
  console.log(ast,'ast')
}