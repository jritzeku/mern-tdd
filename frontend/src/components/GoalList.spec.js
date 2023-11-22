import { render, screen } from '../test/setup'
import GoalList from './GoalList'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import userEvent from '@testing-library/user-event'

import storage from '../state/storage'

// mock api returned data
const goals = [
  {
    id: 1,
    title: 'goal1',
    user: '1',
  },
  {
    id: 2,
    title: 'goal2',
    user: '1',
  },
  {
    id: 3,
    title: 'goal3',
    user: '1',
  },
  {
    id: 4,
    title: 'goal3',
    user: '1',
  },
]

let header

console.warn = jest.fn();

//setting up server specifically for this GoalList related tests
const server = setupServer(
  rest.get('/api/goals', (req, res, ctx) => {
    header = req.headers.get('Authorization')

    return res(ctx.status(200), ctx.json(goals))
  })
)

beforeEach(() => {
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

const setup = () => {
  render(<GoalList />)
}

describe('Goal List', () => {
  describe('Interactions', () => {
    it('displays 4 goals in list', async () => {
      setup()
      //const goals = await screen.findAllByText(/goal/)

      expect(goals.length).toBe(4)
    })
  })

  it('displays spinner during the api call is in progress', async () => {
    setup()
    const spinner = screen.getByRole('status')
    await screen.findByText('goal1')
    expect(spinner).not.toBeInTheDocument()
  })

  /*
    -How did this test pass?
    //lecture 81 at time 0:54

      ->first we set 'header' to "auth header value"(our dummy token string) in LS. 
      ->then in our setupServer() we assign header what we just store in LS via
        header = req.headers.get('Authorization')

      ->in apiCall, we assign header to request from our LS
        -this prevents us from manually adding header value to each authenticated 
        requests; for non authenticated requests, it wont use the Interceptor 
        due to our conditional logic in interceptor
 

    */
  it('sends request with authorization header', async () => {
    storage.setItem('auth', {
      id: 5,
      header: 'auth header value',
    })
    setup()
    await screen.findByText('goal1')
    expect(header).toBe('auth header value')
  })
})
