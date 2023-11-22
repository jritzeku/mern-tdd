import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import GoalPage from './pages/GoalPage'
import AddGoalPage from './pages/AddGoalPage'
import { Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <ToastContainer />
      <NavBar />
      <div className='container pt-3'>
        <Route exact path='/' component={HomePage} />
        <Route path='/signup' component={SignUpPage} />
        <Route path='/login' component={LoginPage} />
        <Route path='/goal/:id' component={GoalPage} />
        <Route path='/addGoal' component={AddGoalPage} />
      </div>
    </>
  )
}

export default App
