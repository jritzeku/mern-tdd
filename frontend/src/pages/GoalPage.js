import { Component } from 'react'
import { getGoalById } from '../api/apiCalls'
import GoalCard from '../components/GoalCard'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

class GoalPage extends Component {
  state = {
    goal: {},
    pendingApiCall: false,
    failResponse: undefined,
  }

  componentDidMount() {
    this.loadGoal()
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousProps.match.params.id !== this.props.match.params.id) {
      this.loadGoal()
    }
  }

  loadGoal = async () => {
    this.setState({ pendingApiCall: true })
    try {
      const response = await getGoalById(this.props.match.params.id)
      this.setState({ goal: response.data })
    } catch (error) {
      this.setState({ failResponse: error.response.data.message })
    }
    this.setState({ pendingApiCall: false })
  }

  render() {
    const { goal, pendingApiCall, failResponse } = this.state

    let content = (
      <Alert type='secondary' center>
        <Spinner size='big' />
      </Alert>
    )
    if (!pendingApiCall) {
      if (failResponse) {
        content = (
          <Alert type='danger' center>
            {failResponse}
          </Alert>
        )
      } else {
        content = <GoalCard goal={goal} loadGoal={this.loadGoal} />
      }
    }

    return <div data-testid='goal-page'>{content}</div>
  }
}

export default GoalPage
