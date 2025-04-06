// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'

const CounterContext = React.createContext();

function useCount() {
  const value = React.useContext(CounterContext);
  
  if (!value) {
    throw new Error('useCount may only be used from within a (child of a) CountProvider')
  }

  return value;
}

function CountProvider({ children }) {
  const [count, setCount] = React.useState(0);
  const value = [count, setCount];

  return <CounterContext.Provider value={value}>
    {children}
  </CounterContext.Provider>
}

function CountDisplay() {
  const [count] = useCount();
  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = useCount();
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>

      {/* <CountDisplay />
      <Counter /> */}
    </div>
  )
}

export default App
