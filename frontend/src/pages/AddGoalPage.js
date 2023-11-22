import { Component } from 'react'
import Input from '../components/Input'

import Alert from '../components/Alert'
import ButtonWithProgress from '../components/ButtonWithProgress'
import { Link } from 'react-router-dom'
import { addGoal } from '../api/apiCalls'
import { toast } from 'react-toastify'

class AddGoal extends Component {
  state = {
    title: '',
    apiProgress: false,
    addGoalSuccess: false,
    errors: {},
  }

  onChange = (event) => {
    const { id, value } = event.target
    const errorsCopy = { ...this.state.errors }
    delete errorsCopy[id]
    this.setState({
      [id]: value,
      errors: errorsCopy,
    })
  }

  submit = async (event) => {
    event.preventDefault()
    const { title } = this.state

   
    const body = {
      title,
    }
 
    this.setState({ apiProgress: true })

    try {
      let data = await addGoal(body)
   
      this.setState({ addGoalSuccess: true })
     //toast.success('Goal as been added!.');

      this.props.history.push('/')
    } catch (error) {
      if (error?.response?.status === 400) {
        this.setState({ errors: error.response.data.validationErrors })
      }
      this.setState({ apiProgress: false })
    }
  }

  render() {
    let disabled = true
    const { title, apiProgress, addGoalSuccess, errors } = this.state

    disabled = title.trim() === ''

    return (
      <div
        className='col-lg-6 offset-lg-3 col-md-8 offset-md-2'
        data-testid='add-goal-page'
      >
        {!addGoalSuccess && (
          <form className='card' data-testid='form-add-goal'>
            <div className='card-header'>
              <h1 className='text-center'>Add a Goal</h1>
            </div>
            <div className='card-body'>
              <Input
                id='title'
                label='Title'
                onChange={this.onChange}
                help={errors.title}
              />

              <div className='text-center'>
                <ButtonWithProgress
                  disabled={disabled}
                  apiProgress={apiProgress}
                  onClick={this.submit}
                >
                  Add Goal
                </ButtonWithProgress>
              </div>
            </div>
          </form>
        )}

        {addGoalSuccess && <Alert>Goal has been added!</Alert>}
      </div>
    )
  }
}

export default AddGoal
