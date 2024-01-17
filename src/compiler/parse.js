// 以下为源码的正则 
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

let root, currentParent //根节点，当前父节点
let stack = []
// 标识元素和文本type
const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null
  }
}

function handleStartTag({ tagName, attrs }) {
  let element = createASTElement(tagName, attrs)
  if (!root) {
    root = element
  }
  currentParent = element
  stack.push(element)
}

function handleEndTag(tagName) {
  let element = stack.pop() // 当遇到结束标签时，取出栈顶的元素
  currentParent = stack[stack.length - 1] // 获取当前栈顶元素（父元素）
  if (currentParent) {
    // 如果存在父元素，将当前元素设置为父元素的子元素
    element.parent = currentParent
    currentParent.children.push(element)
  }
}

// 对文本进行处理
function handleChars(text) {
  text = text.replace(/s/g, '')
  if (text) {
    currentParent.children.push({
      type: TEXT_TYPE,
      text
    })
  }
}

// 解析标签生成ast的核心
export function parse(html) {
  function advance(n) {
    html = html.substring(n)
  }
  function parseStartTag() {
    const start = html.match(startTagOpen)

    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      // 匹配到开始标签 就截取掉
      advance(start[0].length)

      // 匹配属性
      let end, attr
      // 未匹配到闭合标签且仍有属性可以匹配，就继续循环
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] // 正则捕获支持双引号、单引号和无引号的属性值
        }
        match.attrs.push(attr)
      }
      if (end) {
        // 一个标签匹配到结束标签，代表开始标签解析完毕
        advance(1)
        return match
      }
    }

  }


  while (html) {
    let textEnd = html.indexOf('<')
    // 如果<在第一个，说明这是一个标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        // 把解析好的标签名和属性解析生成ast
        handleStartTag(startTagMatch)
        continue
      }

      // 匹配结束标签
      const endTagMatch = html.match(endTag) // 返回结果：匹配成功会返回一个数组，该数组的第0个元素是匹配的全文本，接下来的元素是捕获的文本。
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        handleEndTag(endTagMatch[1])
        continue
      }
    }

    let text
    // 形如 hello<div></div>
    if (textEnd >= 0) {
      // 获取文本
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      handleChars(text)
    }
  }
  return root
}

