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

function useRef(initialState) {
  hookState[hookIndex] = hookState[hookIndex] || { current: initialState }
  return hookState[hookIndex++]
}

function useEffect(callback, deps) {
  if (hookState[hookIndex]) {
    const [lastDestroy, lastDeps] = hookState[hookIndex]

    let isSame = false
    if (lastDeps) {
      isSame = deps.every((item, index) => item === lastDeps[index])
    }
    if (isSame) {
      hookIndex++
    } else {
      const effects = [, deps]
      setTimeout(() => { // 模拟dom渲染完成后
        effects[0] = callback()
      })
      hookState[hookIndex++] = effects
    }
  } else {
    const effects = [, deps]
    setTimeout(() => { // 模拟dom渲染完成后
      effects[0] = callback()
    })
    hookState[hookIndex++] = effects
  }
}

function useLayoutEffect(callback, deps) {
  if (hookState[hookIndex]) {
    const [lastDestroy, lastDeps] = hookState[hookIndex]

    let isSame = false
    if (lastDeps) {
      isSame = deps.every((item, index) => item === lastDeps[index])
    }
    if (isSame) {
      hookIndex++
    } else {
      const effects = [, deps]
      queueMicrotask(() => { // 模拟dom渲染完成后
        effects[0] = callback()
      })
      hookState[hookIndex++] = effects
    }
  } else {
    const effects = [, deps]
    queueMicrotask(() => { // 模拟dom渲染完成后
      effects[0] = callback()
    })
    hookState[hookIndex++] = effects
  }
}

function App() {
  const box1 = useRef()
  const box2 = useRef()

  const style = {
    height: '100px',
    width: '100px'
  }

  useEffect(() => {
    // Dom 渲染完成后才将属性加上，动画正常触发
    box1.current.style.transform = 'translate(300px)'
    box1.current.style.transition = 'all .5s'
  })
  useLayoutEffect(() => {
    // Dom 渲染完成前就已经将属性加上，导致无法触发动画
    box2.current.style.transform = 'translate(300px)'
    box2.current.style.transition = 'all .5s'
  })

  return (
    <div>
      <div ref={box1} style={{...style, background: 'green'}}></div>
      <div ref={box2} style={{...style, background: 'yellow'}}></div>
    </div>
  )
}

const app = createRoot(document.getElementById('root'))

function render() {
  hookIndex = 0 // 确保每次 render 时都是重新按顺序依次获取状态的
  app.render(<App />)
}

render()