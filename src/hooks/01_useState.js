import React from 'react'
import { createRoot } from 'react-dom/client'

// 通过数组和索引来序列 useState 中 state 状态的记录
let hookIndex = 0
let hookState = [] // 用于保存所有状态的数组

function useState(initialState) {
  hookState[hookIndex] = hookState[hookIndex] || initialState

  // 声明一个 currentIndex 用来保证每个 setState 都是指向自己的 state
  const currentIndex = hookIndex
  function setState(newState) {
    hookState[currentIndex] = newState
    render()
  }

  return [hookState[hookIndex++], setState]
}

function App() {
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)

  return (
    <div>
      <h2>第一个当前计数：{count1}</h2>
      <button onClick={() => setCount1(count1+1)}>第一个当前计数点击+1</button>
      <hr/>
      <h2>第二个当前计数：{count2}</h2>
      <button onClick={() => setCount2(count2+1)}>第二个当前计数点击+1</button>
    </div>
  )
}

const app = createRoot(document.getElementById('root'))

function render() {
  hookIndex = 0 // 确保每次 render 时都是重新按顺序依次获取状态的
  app.render(<App />)
}

render()