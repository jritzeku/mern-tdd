import defaultProfileImage from '../assets/profile.png'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import Input from './Input'
import ButtonWithProgress from './ButtonWithProgress'
import Modal from './Modal'
// import { updateUser, deleteUser } from '../api/apiCalls'
import { updateGoal, deleteGoal } from '../api/apiCalls'
import { useHistory, useParams } from 'react-router-dom'
import { logoutSuccess } from '../state/authActions'

const GoalCard = (props) => {
  const [editMode, setEditMode] = useState(false)
  const [deleteApiProgress, setDeleteApiProgress] = useState(false)
  const [updateApiProgress, setUpdateApiProgress] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  const { id: goalId } = useParams()

  const { goal, loadGoal } = props

  const [goalTitle, setGoalTitle] = useState(goal.title)

  // const { id } = useSelector((store) => ({
  //   id: store.id,

  // }))

  const { id, username } = useSelector((store) => ({
    id: store.id,
    //  username: store.username
  }))

  // console.log('id:', id)
  // console.log('goal.user:', goal.user)

  useEffect(() => {
    // console.log('id:', id)
    // console.log('goal.user:', goal.user)

    // console.log('goal id:' + goal.id)
    // console.log('goald user:', goal.user)
    // console.log('goal title:' + goal.title)
  }, [id, goalTitle])

  const onClickSave = async () => {
    setUpdateApiProgress(true)
    try {
      //NOTE: remember to use goal id since updating goal; not user id
     await updateGoal(goalId, {
        title: goalTitle,
      })
 
      setEditMode(false)
      loadGoal()

 
    } catch (error) {}
    setUpdateApiProgress(false)
  }

  const onClickCancel = () => {
    setEditMode(false)

    setGoalTitle(goalTitle)
  }
  const onClickDelete = async () => {
    setDeleteApiProgress(true)
    try {
      await deleteGoal(goalId)
      history.push('/')
      //NOTE: not relevant, since we are not deleting our account; just goal
      //dispatch(logoutSuccess())
    } catch (error) {}

    setDeleteApiProgress(false)
  }

  let content

  if (editMode) {
    content = (
      <>
        <Input
          label='Change your goal'
          id='goalTitle'
          initialValue={goalTitle}
          onChange={(event) => setGoalTitle(event.target.value)}
        />
        <ButtonWithProgress
          onClick={onClickSave}
          apiProgress={updateApiProgress}
        >
          Save
        </ButtonWithProgress>{' '}
        <button className='btn btn-outline-secondary' onClick={onClickCancel}>
          Cancel
        </button>
      </>
    )
  } else {
    content = (
      <>
        <h1>{goal.title}</h1>

        <p>created at: {goal.createdAt} </p>

        <p>created by: {goal.user}</p>

        {/* ensures ur owner of this goal  */}
        {goal?.user?.toString() === id?.toString() && (
          <>
            <div>
              <button
                className='btn btn-outline-success'
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            </div>
            <div className='pt-2'>
              <button
                className='btn btn-danger'
                onClick={() => setModalVisible(true)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <div className='card text-center'>
        <div className='card-header'>
          {/* <img
            src={defaultProfileImage}
            alt='profile'
            width='200'
            height='200'
            className='rounded-circle shadow'
          /> */}

          <h3>Goal Details</h3>
        </div>
        <div className='card-body'>{content}</div>
      </div>
      {modalVisible && (
        <Modal
          content='Are you sure to delete your goal?'
          onClickCancel={() => setModalVisible(false)}
          onClickConfirm={onClickDelete}
          apiProgress={deleteApiProgress}
        />
      )}
    </>
  )
}
export default GoalCard
