// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

// function countReducer(state, action) {
//   switch(action.type) {
//     case 'INCREMENT': {
//       return { ...state, count: state.count + action.step };
//     }

//     default: {
//       throw new Error(`Unsupported action type ${action.type}`);
//     }
//   }
// }

// function Counter({initialCount = 0, step = 1}) {
//   // 🐨 replace React.useState with React.useReducer.
//   // 💰 React.useReducer(countReducer, initialCount)
//   // const [state, setState] = React.useReducer(countReducer, { count: initialCount });
//   const [state, dispatch] = React.useReducer(countReducer, {
//     count: initialCount,
//   })
//   const { count } = state;

//   // 💰 you can write the countReducer function so you don't have to make any
//   // changes to the next two lines of code! Remember:
//   // The 1st argument is called "state" - the current value of count
//   // The 2nd argument is called "newState" - the value passed to setCount
//   // const increment = () => setState({ count: count + step})
//   // const increment = () => setState((currentState) => ({ count: currentState.count + step }))
//   const increment = () => dispatch({type: 'INCREMENT', step})
//   return <button onClick={increment}>{count}</button>
// }

function getDog(dogId, options) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, { name: `Jack-${dogId}`, dogId });
  });
}

function DogInfo({dogId}) {
  const controllerRef = React.useRef(null)
  const [dog, setDog] = React.useState(null)
  function fetchDog() {
    controllerRef.current?.abort()

    controllerRef.current = new AbortController()
    getDog(dogId, {signal: controllerRef.current.signal}).then(
      (d) => setDog(d),
      (error) => {
        // handle the error
      },
    )
  }

  // didMount
  React.useEffect(() => {
    console.log('didMount useEffect');
    fetchDog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // didUpdate
  const previousDogId = usePrevious(dogId)
  
  useUpdate(() => {
    if (previousDogId !== dogId) {
      console.log('callback called dogId = ', dogId);
      console.log('__________________________');
      fetchDog()
    }
  })
  console.log('DogInfo component', previousDogId, dogId);

  // willUnmount
  React.useEffect(() => {
    console.log('willUnmount useEffect');
    console.log('__________________________');
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  console.log('before return');
  console.log('__________________________');

  return <div>{dog?.name || 'Loading...'}</div>
}

function usePrevious(value) {
  const ref = React.useRef()
  console.log('usePrevious call dogId', ref.current, value);

  React.useEffect(() => {
    ref.current = value
    console.log('usePrevious useEffect dogId', ref.current);
  }, [value])
  return ref.current
}

function useUpdate(callback) {
  const hasMounted = React.useRef(false)
  console.log('useUpdate call', hasMounted.current);

  React.useEffect(() => {
    console.log('useUpdate useEffect', hasMounted.current);
    if (hasMounted.current) {
      callback()
    } else {
      hasMounted.current = true
    }
  })
}


function App() {
  const [dogId, setDogId] = React.useState(10);

  function handleClick() {
    setDogId(Math.round(Math.random() * 100));
  }

  return <>
    <button onClick={handleClick}>Update dog id</button>
    <DogInfo dogId={dogId} />
  </>
}

export default App
