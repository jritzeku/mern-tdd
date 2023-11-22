import GoalList from '../components/GoalList'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'


const HomePage = () => {
  const { id } = useSelector((store) => ({
    id: store.id,
  }))

  return (
    <div data-testid='home-page'>
      {id ? <GoalList /> : <Link to='/login'>Sign in to set goals!.</Link>}
    </div>
  )
}

export default HomePage
