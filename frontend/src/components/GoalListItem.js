import { withRouter } from 'react-router-dom'

const GoalListItem = (props) => {
  const { goal, history, index } = props

 
  return (
    <li
      className='list-group-item list-group-item-action'
      //may need to use ._id
      onClick={() => history.push(`/goal/${goal?._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <strong>{index}.) </strong>
      {goal?.title}
    </li>
  )
}

export default withRouter(GoalListItem)
