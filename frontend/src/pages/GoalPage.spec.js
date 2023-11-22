import { render, screen, waitFor } from '../test/setup'
import GoalPage from './GoalPage'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
const server = setupServer()



beforeEach(() => {
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Goal Page', () => {
  beforeEach(() => {
    let testGoal = {
      goalId: 1,
      user: 1,
      title: 'goal1',
    }
    server.use(
      rest.get('/api/goals/:id', (req, res, ctx) => {
        //user id found
        if (req.params.id === '1') {
          return res(
            ctx.json({
              id: testGoal.id,
              title: testGoal.title,
            })
          )
          //user id not found
        } else {
          return res(ctx.status(404), ctx.json({ message: 'Goal not found' }))
        }
      })
    )
  })

  it('displays user name on page when user is found', async () => {
    const match = { params: { id: 1 } }
    render(<GoalPage match={match} />)
    await waitFor(() => {
      expect(screen.queryByText('goal1')).toBeInTheDocument()
    })
  })

  it('displays spinner while the api call is in progress', async () => {
    const match = { params: { id: 1 } }
    render(<GoalPage match={match} />)
    const spinner = screen.getByRole('status')
    await screen.findByText('goal1')
    expect(spinner).not.toBeInTheDocument()
  })
  it('displays error message received from backend when the user is not found', async () => {
    //does not equal our test goal id so should fail
    const match = { params: { id: 100 } }
    render(<GoalPage match={match} />)
    await waitFor(() => {
      expect(screen.queryByText('Goal not found')).toBeInTheDocument()
    })
  })
})
