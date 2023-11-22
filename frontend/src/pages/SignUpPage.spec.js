import SignUpPage from './SignUpPage'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '../test/setup'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

let requestBody
let counter = 0

const server = setupServer(
  //capture request
  rest.post('/api/users', (req, res, ctx) => {
    requestBody = req.body
    counter += 1

    //respond with mocked status + json body(if returned )
    return res(ctx.status(200))
  })
)

beforeEach(() => {
  counter = 0

  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Sign Up Page', () => {
  describe('Layout', () => {
    it('has header', () => {
      render(<SignUpPage />)
      const header = screen.queryByRole('heading', { name: 'Sign Up' })
      expect(header).toBeInTheDocument()
    })

    it('has username input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('Username')
      expect(input).toBeInTheDocument()
    })

    it('has email input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('E-mail')
      expect(input).toBeInTheDocument()
    })
    it('has password input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('Password')
      expect(input).toBeInTheDocument()
    })
    it('has password type for password input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('Password')
      //access 'type' attribute from input via dot notation
      expect(input.type).toBe('password')
    })
    it('has password repeat input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('Password Repeat')
      expect(input).toBeInTheDocument()
    })
    it('has password type for password repeat input', () => {
      render(<SignUpPage />)
      const input = screen.getByLabelText('Password Repeat')
      expect(input.type).toBe('password')
    })
    it('has Sign Up button', () => {
      render(<SignUpPage />)
      //differentiate between various buttons by supplying name option
      const button = screen.queryByRole('button', { name: 'Sign Up' })
      expect(button).toBeInTheDocument()
    })

    it('disables the button initially', () => {
      render(<SignUpPage />)
      const button = screen.queryByRole('button', { name: 'Sign Up' })
      //will be true since form empty initially
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    let button, usernameInput, emailInput, passwordInput, passwordRepeatInput

    const setup = () => {
      /*
      -In this function we simulate entering form data
        ->first we render the sign up page 
        ->then we enter following values into inputs
      */
      render(<SignUpPage />)
      usernameInput = screen.getByLabelText('Username')
      emailInput = screen.getByLabelText('E-mail')
      passwordInput = screen.getByLabelText('Password')
      passwordRepeatInput = screen.getByLabelText('Password Repeat')
      /*
      -'user-event' is a companion library for RTL that simulates user interactions by
       dispatching the events that would happen if the interaction took place in
        a browser.
      */
      userEvent.type(usernameInput, 'user1')
      userEvent.type(emailInput, 'user1@mail.com')
      userEvent.type(passwordInput, 'P4ssword')
      userEvent.type(passwordRepeatInput, 'P4ssword')
      button = screen.queryByRole('button', { name: 'Sign Up' })
    }
    it('enables the button when password and password repeat fields have same value', () => {
      setup()
      //true, since we enter valid inputs in our setup
      expect(button).toBeEnabled()
    })
    it('displays spinner after clicking the submit', async () => {
      setup()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      userEvent.click(button)
      //here "status" is a role attribute we explicitly assigned to span elem.
      const spinner = screen.getByRole('status')

      expect(spinner).toBeInTheDocument()
      // await screen.findByText(
      //   'Sign up successful! Log in to your account'
      // )
    })
    //Sign up successful! Log in to your account
    it('displays registration success message with link to login', async () => {
      setup()
      const message = 'Sign up successful! Log in to your account'
      //initially msg is not shown
      expect(screen.queryByText(message)).not.toBeInTheDocument()
      userEvent.click(button)
      //after successful registration, our msg is shown
      const text = await screen.findByText(message)
      expect(text).toBeInTheDocument(message)
    })

    it('hides sign up form after successful sign up request', async () => {
      setup()
      //select by data attribute
      const form = screen.getByTestId('form-sign-up')
      userEvent.click(button)

      /*
        -It was suggested to use waitFor() from RTL  rather than some manual timeout since that is not
        very reliable. 
            ->"When in need to wait for any period of time you can use waitFor, to
             wait for your expectations to pass..."" 
  
        */
      await waitFor(() => {
        expect(form).not.toBeInTheDocument()
      })
    })

    const generateValidationError = (field, message) => {
      return rest.post('/api/users', (req, res, ctx) => {
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

    //each() is shortcut way of testing that uses same logic; just diff parameters
    it.each`
      field         | message
      ${'username'} | ${'Username cannot be null'}
      ${'email'}    | ${'E-mail cannot be null'}
      ${'password'} | ${'Password cannot be null'}
    `('displays $message for $field', async ({ field, message }) => {
      server.use(generateValidationError(field, message))
      setup()
      userEvent.click(button)
      const validationError = await screen.findByText(message)
      expect(validationError).toBeInTheDocument()
    })

    it('hides spinner and enables button after response received', async () => {
      //just a dummy response so we can get response to perform test
      server.use(generateValidationError('username', 'Username cannot be null'))
      setup()
      userEvent.click(button)
      await screen.findByText('Username cannot be null')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(button).toBeEnabled()
    })

    it('displays mismatch message for password repeat input', () => {
      setup()
      userEvent.type(passwordInput, 'P4ssword')
      userEvent.type(passwordRepeatInput, 'AnotherP4ssword')
      const validationError = screen.queryByText('Password mismatch')
      expect(validationError).toBeInTheDocument()
    })

    it.each`
      field         | message                      | label
      ${'username'} | ${'Username cannot be null'} | ${'Username'}
      ${'email'}    | ${'E-mail cannot be null'}   | ${'E-mail'}
      ${'password'} | ${'Password cannot be null'} | ${'Password'}
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
