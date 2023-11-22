import { Link, useHistory } from 'react-router-dom'
import logo from '../assets/hoaxify.png'

import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../api/apiCalls'
import { logoutSuccess } from '../state/authActions'

const NavBar = (props) => {
  const auth = useSelector((store) => store)
  const dispatch = useDispatch()
  const history = useHistory()

  // const onClickLogout = async (event) => {
  //   event.preventDefault()
  //   try {
  //     await logout()
  //     history.push('/')
  //   } catch (error) {}
  //   dispatch(logoutSuccess())
  // }

  /*
NOTE:

-For my logout, im not interacting with backend 
  ->so no ned for async/await here nor in testing in App.spec.js
  */
  const onClickLogout = (event) => {
    event.preventDefault()

    dispatch(logoutSuccess())
  }

  return (
    <nav className='navbar navbar-expand navbar-light bg-light shadow-sm'>
      <div className='container'>
        <Link className='navbar-brand' to='/' title='Home'>
          Goalify
        </Link>
        <ul className='navbar-nav'>
          {!auth.isLoggedIn && (
            <>
              <Link className='nav-link' to='/signup'>
                Sign Up
              </Link>
              <Link className='nav-link' to='/login'>
                Login
              </Link>
            </>
          )}
          {auth.isLoggedIn && (
            <>
              <Link className='nav-link' to='/addGoal'>
                Add Goal
              </Link>
              <a href='/' className='nav-link' onClick={onClickLogout}>
                Logout
              </a>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
