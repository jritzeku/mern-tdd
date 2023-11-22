import { AUTH } from './Constants'

const reducer = (state, action) => {
  if (action.type === AUTH.LOGIN_SUCCESS) {
    return {
      ...state,
      ...action.payload,
      isLoggedIn: true,
    }
  } else if (action.type === AUTH.LOGOUT_SUCCESS) {
    return {
      isLoggedIn: false,
    }
  }
  return state
}

export default reducer
