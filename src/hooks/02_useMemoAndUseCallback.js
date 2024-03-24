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

function useMemo (factory, deps) {
  if (hookState[hookIndex]) {
    // 存在缓存
    let [lastMemo, lastDeps] = hookState[hookIndex]

    // 判断 lastDeps 和 deps 的值有没有发生变化，有则需要重新缓存
    const isSame = deps.every((item, index) => item === lastDeps[index])

    if (isSame) {
      hookIndex++
      // 说明没有变化，直接返回缓存的对象
      return lastMemo
    } else {
      // 说明有变化，重新缓存
      const newMemo = factory()
      hookState[hookIndex++] = [newMemo, deps] // 将第一次结果缓存起来
      return newMemo
    }
  } else {
    // 没有缓存过对象
    const newMemo = factory()
    hookState[hookIndex++] = [newMemo, deps]
    return newMemo
  }
}

function useCallback (callback, deps) {
  if (hookState[hookIndex]) {
    // 存在缓存
    let [lastCallback, lastDeps] = hookState[hookIndex]

    // 判断 lastDeps 和 deps 的值有没有发生变化，有则需要重新缓存
    const isSame = deps.every((item, index) => item === lastDeps[index])

    if (isSame) {
      hookIndex++
      // 说明没有变化，直接返回缓存的对象
      return lastCallback
    } else {
      // 说明有变化，重新缓存
      hookState[hookIndex++] = [callback, deps] // 将第一次结果缓存起来
      return callback
    }
  } else {
    // 没有缓存过对象
    hookState[hookIndex++] = [callback, deps]
    return callback
  }
}

function Child({ data, onButtonClick }) {
  console.log('rerender')

  return (
    <div>
      <h2>{data.age}</h2>
      <button onClick={onButtonClick}>button</button>
    </div>
  )
}

const ChildMemo = React.memo(Child)

function App() {
  const [name, setName] = useState('净植')
  const [age, setAge] = useState(18)

  const data = useMemo(() => ({ age }), [age])
  const handleButtonClick = useCallback(() => setAge(age + 1), [age])

  return (
    <div className="App">
      <h2>{name}</h2>
      <input value={name} onInput={(e) => setName(e.target.value)}></input>
      <hr/>
      <ChildMemo data={data} onButtonClick={handleButtonClick}></ChildMemo>
    </div>
  )
}

const app = createRoot(document.getElementById('root'))

function render() {
  hookIndex = 0 // 确保每次 render 时都是重新按顺序依次获取状态的
  app.render(<App />)
}

render()