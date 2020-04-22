import './index.scss'

/*
* webpack 遇到 import(****) 这样的语法的时候，会这样处理：

以**** 为入口新生成一个 Chunk
当代码执行到 import 所在的语句时，才会加载该 Chunk 所对应的文件
*/
import('./lazy-load')

//index.js
class Animal {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}

const dog = new Animal('dog');
console.log('aaa');

// 增加以下代码才能保证HMR不刷新整个页面
if(module && module.hot) {
  module.hot.accept()
}
