import axios from 'axios'
 
import { store } from '../state/store'

/*
-Why do we use Axios interceptors in react?

Axios interceptors For ReactJs Interceptors are useful because 
they allow developers to add custom functionality to requests 
and responses without modifying the actual code that makes the
request
*/

/*
-In our case, our Interceptor adds the 'Authorization' header for 
authentication required requests 
*/
axios.interceptors.request.use((request) => {
  //request.headers['Accept-Language'] = i18n.language;
  const { header } = store.getState()
  //for authenticated requests
  if (header) {
    request.headers['Authorization'] = header
  }
  return request
})

export const signUp = (body) => {
  return axios.post('/api/users', body)
}

// export const activate = (token) => {
//   return axios.post('/api/1.0/users/token/' + token)
// }

// export const loadUsers = (page) => {
//   return axios.get('/api/1.0/users', { params: { page, size: 3 } })
// }

export const loadUserGoals = (page) => {
  return axios.get('/api/goals')
}

// export const getUserById = (id) => {
//   return axios.get(`/api/users/${id}`)
// }

export const getGoalById = (id) => {
  return axios.get(`/api/goals/${id}`)
}

export const login = (body) => {
  return axios.post('/api/users/auth', body)
}

// export const updateUser = (id, body) => {
//   return axios.put(`/api/users/${id}`, body)
// }


export const addGoal = ( body) => {
 
  return axios.post(`/api/goals`, body)
}

export const updateGoal = (id, body) => {
  return axios.put(`/api/goals/${id}`, body)
}

// export const logout = () => {
//   return axios.post('/api/logout')
// }

// export const deleteUser = (id) => {
//   return axios.delete(`/api/1.0/users/${id}`)
// }

export const deleteGoal = (id) => {
  return axios.delete(`/api/goals/${id}`)
}
