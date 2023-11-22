import { useState, useEffect } from 'react'
import { loadUserGoals } from '../api/apiCalls'
import GoalListItem from './GoalListItem'
import Spinner from './Spinner'
import { addGoal} from '../api/apiCalls'

const GoalList = () => {
  const [pendingApiCall, setPendingApiCall] = useState(false)
  const [goals, setGoals] = useState([])
  const [addMode, setAddMode] = useState(false)
  const [updateApiProgress, setUpdateApiProgress] = useState(false)

  //equivalent to componentDidMount()
  useEffect(() => {
    loadData()
  }, [])


  const loadData = async (pageIndex) => {
    setPendingApiCall(true)

    try {
      const response = await loadUserGoals(pageIndex)
      //may need to update state based on prev?
      setGoals(response.data)
    } catch (error) {}

    setPendingApiCall(false)
  }

 


  return (
    <div className='card'>
      <div className='card-header text-center'>
        <h3>My Goals</h3>
        <span className='text-center text-muted'>(click on a goal to view detail)</span>
      </div>

      <ul className='list-group list-group-flush'>
        {goals?.map((goal, index = 0) => {
          index++
          return <GoalListItem key={goal._id} goal={goal} index={index} />
        })}
      </ul>
      <div className='card-footer text-center'>
        {pendingApiCall && <Spinner />}
      </div>
    </div>
  )
}

export default GoalList
