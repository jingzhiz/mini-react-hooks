import React from 'react'
import { createRoot } from 'react-dom/client'

// 通过数组和索引来序列 useState 中 state 状态的记录
let hookIndex = 0
let hookState = [] // 用于保存所有状态的数组

function useState(initialState) {
  // hookState[hookIndex] = hookState[hookIndex] || initialState

  // // 声明一个 currentIndex 用来保证每个 setState 都是指向自己的 state
  // const currentIndex = hookIndex
  // function setState(newState) {
  //   hookState[currentIndex] = newState
  //   render()
  // }

  // return [hookState[hookIndex++], setState]
  return useReducer(null, initialState)
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

function useReducer(reducer, initialState) {
  hookState[hookIndex] = hookState[hookIndex] || initialState
  let currentIndex = hookIndex
  function dispatch(action) {
    hookState[currentIndex] = reducer ? reducer(hookState[currentIndex], action) : action
    render()
  }
  return [hookState[hookIndex++], dispatch]
}

function useContext(context) {
  return context._currentValue
}

function useImperativeHandle(ref, handle) {
  if (ref) {
    ref.current = handle()
  }
}

function Child(props, ref) {
  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        console.log('子组件获取焦点')
      },
      blur: () => {
        console.log('子组件失去焦点')
      }
    }
  })

  return (
    // <input ref={ref} type='text' placeholder='请输入' />
    <input type='text' placeholder='请输入' />
  )
}

const ForwardRefChild = React.forwardRef(Child)

function App() {
  const childRef = useRef()

  const getFocus = () => {
    console.log(childRef.current)
    childRef.current.focus()
  }

  return (
    <>
      <ForwardRefChild ref={childRef}/>
      <button onClick={getFocus}>子组件获取焦点</button>
    </>
  )
}

const app = createRoot(document.getElementById('root'))

function render() {
  hookIndex = 0 // 确保每次 render 时都是重新按顺序依次获取状态的
  app.render(<App />)
}

render()