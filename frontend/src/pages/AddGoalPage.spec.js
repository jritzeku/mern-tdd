import AddGoalPage from './AddGoalPage'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '../test/setup'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import storage from '../state/storage'

let requestBody
let counter = 0

const server = setupServer(
  //capture request
  rest.post('/api/goals', (req, res, ctx) => {
    requestBody = req.body
    counter += 1

    //respond with mocked status + json body(if returned )
    return res(ctx.status(200))
  })
)


beforeEach(() => {
  counter = 0
  /*
    -resetHandler() removes any request handlers that were added on runtime
     (after the initial setupServer call); useful as a clean up mechanism between 
     multiple test suites that leverage runtime request handlers.
    */
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Add Goal Page', () => {
  describe('Layout', () => {
    it('has header', () => {
      render(<AddGoalPage />)
      /*
            -'screen' object from the React Testing Library (RTL) provides
             methods for querying the rendered elements of the DOM in order 
             to make assertions about their text content, attributes, and more.
      
            -here we search for h1 element
            */
      const header = screen.queryByRole('heading', { name: 'Add a Goal' })
      expect(header).toBeInTheDocument()
    })

    it('has goal title input', () => {
      render(<AddGoalPage />)
      const input = screen.getByLabelText('Title')
      expect(input).toBeInTheDocument()
    })
    it('has  button', () => {
      render(<AddGoalPage />)
      //differentiate between various buttons by supplying name option
      const button = screen.queryByRole('button', { name: 'Add Goal' })
      expect(button).toBeInTheDocument()
    })
    it('disables the button initially', () => {
      render(<AddGoalPage />)
      const button = screen.queryByRole('button', { name: 'Add Goal' })
      //will be true since form empty initially
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    let button, titleInput

    const setup = () => {
      /*
      -In this function we simulate entering form data
        ->first we render the sign up page 
        ->then we enter following values into inputs
      */

      storage.setItem('auth', {
        id: 5,

        header: 'auth header value',
      })

      render(<AddGoalPage />)
      titleInput = screen.getByLabelText('Title')

      /*
      -'user-event' is a companion library for RTL that simulates user interactions by
       dispatching the events that would happen if the interaction took place in
        a browser.
      */
      userEvent.type(titleInput, 'goal1')

      button = screen.queryByRole('button', { name: 'Add Goal' })
    }

    it('enables the button when password and password repeat fields have same value', () => {
      setup()
      //true, since we enter valid inputs in our setup
      expect(button).toBeEnabled()
    })

    /*
    NOTE: 
    
    -I was little doubtful this test would work since it redirects to diff. component
    after successfully adding goal. But it still works. 
    */
    it('sends goal to backend after clicking the button', async () => {
      setup()
      userEvent.click(button)

      expect(
        await screen.findByText('Goal has been added!')
      ).toBeInTheDocument()

      expect(requestBody).toEqual({
        title: 'goal1',
      })
    })

    it('displays spinner after clicking  Add Goal button', async () => {
      setup()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      userEvent.click(button)
      //here "status" is a role attribute we explicitly assigned to span elem.
      const spinner = screen.getByRole('status')

      expect(spinner).toBeInTheDocument()
      await screen.findByText('Goal has been added!')
    })

    const generateValidationError = (field, message) => {
      return rest.post('/api/goals', (req, res, ctx) => {
        return res(
          //status code
          ctx.status(400),
          //json response
          ctx.json({
            validationErrors: { [field]: message },
          })
        )
      })
    }

    it.each`
      field      | message
      ${'title'} | ${'Title cannot be null'}
    `('displays $message for $field', async ({ field, message }) => {
      server.use(generateValidationError(field, message))
      setup()
      userEvent.click(button)
      const validationError = await screen.findByText(message)
      expect(validationError).toBeInTheDocument()
    })

    it('hides spinner and enables button after response received', async () => {
      //just a dummy response so we can get response to perform test
      server.use(generateValidationError('title', 'Title cannot be null'))
      setup()
      userEvent.click(button)
      await screen.findByText('Title cannot be null')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(button).toBeEnabled()
    })

    it.each`
      field      | message                   | label
      ${'title'} | ${'Title cannot be null'} | ${'Title'}
    `(
      'clears validation error after $field is updated',
      async ({ field, message, label }) => {
        server.use(generateValidationError(field, message))
        setup()
        userEvent.click(button)
        const validationError = await screen.findByText(message)
        /*
      -update the field so no error should show; here we literally type
        ->here we enter anything in field and should be good
      */
        userEvent.type(screen.getByLabelText(label), 'updated')
        expect(validationError).not.toBeInTheDocument()
      }
    )
  })
})

/*
NOTE: 
-Test the value of state of component?
  ->NO!! Violation of RTL principle
  https://stackoverflow.com/questions/61813319/check-state-of-a-component-using-react-testing-library
*/
