import React from 'react'
// import logo from './logo.svg'
import './App.css'

console.log('React Version', React.version)

const class2type = {}

for (const name of 'Boolean Number String Function Array Date RegExp Object Error'.split(' ')) {
  class2type['[object ' + name + ']'] = name.toLowerCase()
}

function type(obj) {
  // null undefined boolean number string function array date regexp object error
  // 其他的都返回 object 例如：DOM对象
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object'
}

function App() {
  const obj = [
    {
      id: 1,
      type: 'click',
      props: { name: '', age: 0 },
      children: [
        {
          id: 11,
          type: 'open',
          props: { url: '', params: '' },
        },
        {
          id: 12,
          type: 'catch',
          props: { url: '', title: '' },
          name: undefined,
        },
      ],
    },
    {
      id: 2,
      type: 'move',
      props: { top: 0, left: 0 },
    },
  ]

  function forSetValue(dataSource, id, args, resolve, reject, origin) {
    const index = dataSource.findIndex((item) => item.id === id)
    if (index >= 0) {
      for (const item in args) {
        if (item === 'children') continue
        // 原字段值
        const oldValue = dataSource[index][item]
        // 原字段值类型
        const oldValueType = type(oldValue)
        // 新字段值
        const newValue = args[item]
        // 新字段值类型
        const newValueType = type(newValue)

        // 如果原字段值非函数，而新字段值却是一个函数，则使用函数的返回值，如果函数没有返回值则不修改，如果原字段值没有值，则将该函数赋值给它
        // 如果当前字段对应的值是函数，则不会进入次判断，走到下文，直接覆盖赋值
        if (oldValueType !== 'function' && newValueType === 'function') {
          // 此处处理有点巧妙，字段存在则使用函数返回值否则不修改，字段不存在则使用函数返回值或函数本身
          dataSource[index][item] = newValue(oldValue) || oldValue || newValue
          continue
        }
        // 对象类型合并
        if (oldValueType === 'object') {
          dataSource[index][item] = {
            ...oldValue,
            ...newValue,
          }
          continue
        }
        // 其他类型覆盖
        dataSource[index][item] = newValue
      }
      return resolve({ dataSource: origin, data: dataSource[index] })
    } else {
      for (const item of dataSource) {
        const children = item.children
        if (children && 0 in children) return forSetValue(children, id, args, resolve, reject, origin)
      }
    }
    return reject()
  }

  function setProps(params) {
    const { id = '', ...args } = params
    return new Promise(function (resolve, reject) {
      // id不存在 或者 没有传入除id以外任何参数
      if (!id || Object.keys(args).length === 0) reject()
      forSetValue(obj, id, args, resolve, reject, obj)
    })
  }

  setProps({
    id: 12,
    props: (data) => {
      return { ...data, name: 'lucas', age: 30 }
    },
    title: '点击',
    description: '点击什么呢',
    name: () => [1, 2, 3],
  })
    .then(({ dataSource, data }) => {
      console.log('success', dataSource, data)
    })
    .catch(() => {
      console.log('error', obj)
    })

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  )
}

// console.log(<div>11</div>)

export default App
