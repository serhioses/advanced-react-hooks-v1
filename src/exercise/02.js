// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function useSafeDispatch(dispatch) {
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => isMountedRef.current = false;
  }, []);

  return React.useCallback((...args) => {
    if (isMountedRef.current) {
      dispatch(...args);
    }
  }, [dispatch]);
}

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

// function useAsync(asyncCallback, initialState) {
//   const [state, dispatch] = React.useReducer(asyncReducer, initialState)

//   React.useEffect(() => {
//     const promise = asyncCallback()
//     if (!promise) {
//       return
//     }

//     dispatch({type: 'pending'})

//     promise.then(
//       (data) => { dispatch({ type: 'resolved', data }) },
//       (error) => { dispatch({ type: 'rejected', error }) },
//     )
//   }, [asyncCallback])

//   return state;
// }

function useAsync(initialState) {
  const [state, dispatch] = React.useReducer(asyncReducer, initialState)
  const safeDispatch = useSafeDispatch(dispatch);

  const run = React.useCallback((promise) => {
    dispatch({type: 'pending'})

    promise.then(
      (data) => { safeDispatch({ type: 'resolved', data }) },
      (error) => { safeDispatch({ type: 'rejected', error }) },
    )
  }, [safeDispatch]);

  return { ...state, run };
}

function PokemonInfo({pokemonName}) {
  // const asyncCallback = React.useCallback(() => {
  //   if (!pokemonName) {
  //     return
  //   }
  //   return fetchPokemon(pokemonName)
  // }, [pokemonName]);

  // const state = useAsync(asyncCallback, {
  //   status: pokemonName ? 'pending' : 'idle',
  //   data: null,
  //   error: null,
  // }, [pokemonName])

  // const {data: pokemon, status, error} = state

  const { data: pokemon, status, error, run } = useAsync({status: pokemonName ? 'pending' : 'idle'});

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    }

    const pokemonPromise = fetchPokemon(pokemonName);
    run(pokemonPromise);
  }, [pokemonName, run]);

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
