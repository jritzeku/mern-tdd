import { createStore } from 'redux'
import authReducer from './authReducer'
// import goalReducer from './goalReducer'
import storage from './storage'

export let store

const createAppStore = () => {
  const initialState = storage.getItem('auth') || {
    isLoggedIn: false,
    id: '',
    
  }

  store = createStore(
    authReducer,
    //  goalReducer,
    initialState,
    //allows dev tool extension access to store
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )

  //subscribe() runs whenever our store changes and hence we set our LS again
  store.subscribe(() => {
    storage.setItem('auth', store.getState())
  })

  return store
}

export default createAppStore
