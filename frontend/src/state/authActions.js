import { AUTH } from './Constants'
export const loginSuccess = (payload) => {
  return {
    type: AUTH.LOGIN_SUCCESS,
    payload,
  }
}

 

export const logoutSuccess = () => {
  return {
    type: AUTH.LOGOUT_SUCCESS,
  }
}
