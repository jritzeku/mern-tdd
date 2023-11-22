import { render, screen, waitForElementToBeRemoved } from '../test/setup'
import LoginPage from './LoginPage'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import en from '../locale/en.json'
import tr from '../locale/tr.json'
import storage from '../state/storage'

let requestBody,
  acceptLanguageHeader,
  count = 0
const server = setupServer(
  rest.post('/api/users/auth', (req, res, ctx) => {
    requestBody = req.body
    count += 1
    acceptLanguageHeader = req.headers.get('Accept-Language')
    return res(ctx.status(401), ctx.json({ message: 'Incorrect credentials' }))
  })
)


beforeEach(() => {
  count = 0
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

//simulates successful login
const loginSuccess = rest.post('/api/users/auth', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      id: 5,
      username: 'user5',
      image: null,
      token: 'abcdefgh',
    })
  )
})

describe('Login Page', () => {
  describe('Layout', () => {
    it('has header', () => {
      render(<LoginPage />)
      const header = screen.queryByRole('heading', { name: 'Login' })
      expect(header).toBeInTheDocument()
    })
    it('has email input', () => {
      render(<LoginPage />)
      const input = screen.getByLabelText('E-mail')
      expect(input).toBeInTheDocument()
    })
    it('has password input', () => {
      render(<LoginPage />)
      const input = screen.getByLabelText('Password')
      expect(input).toBeInTheDocument()
    })
    it('has password type for password input', () => {
      render(<LoginPage />)
      const input = screen.getByLabelText('Password')
      expect(input.type).toBe('password')
    })
    it('has Login button', () => {
      render(<LoginPage />)
      const button = screen.queryByRole('button', { name: 'Login' })
      expect(button).toBeInTheDocument()
    })
    it('disables the button initially', () => {
      render(<LoginPage />)
      const button = screen.queryByRole('button', { name: 'Login' })

      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    let button, emailInput, passwordInput
    /*
    -Here in setup() we fill the form but dont submit 
      ->also default email is provided

    */
    const setup = (email = 'user100@mail.com') => {
      render(<LoginPage />)
      emailInput = screen.getByLabelText('E-mail')
      passwordInput = screen.getByLabelText('Password')
      userEvent.type(emailInput, email)
      userEvent.type(passwordInput, 'P4ssword')
      button = screen.queryByRole('button', { name: 'Login' })
    }
    it('enables the button when email and password inputs are filled', () => {
      setup()
      expect(button).toBeEnabled()
    })
    it('displays spinner during api call', async () => {
      setup()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      userEvent.click(button)

      const spinner = screen.getByRole('status')
      /*
        -Unlike in Signup test, here we assert spinner visibility differently
          ->
        */
      await waitForElementToBeRemoved(spinner)
    })
    it('sends email and password to backend after clicking the button', async () => {
      setup()
      userEvent.click(button)
      const spinner = screen.getByRole('status')
      await waitForElementToBeRemoved(spinner)
      expect(requestBody).toEqual({
        email: 'user100@mail.com',
        password: 'P4ssword',
      })
    })
    it('disables the button when there is an api call', async () => {
      setup()
      userEvent.click(button)
      userEvent.click(button)
      const spinner = screen.getByRole('status')
      await waitForElementToBeRemoved(spinner)
      expect(count).toEqual(1)
    })

    it('displays authentication fail message', async () => {
      setup()
      //should fail because default email is WRONG! correct email is user5@mail.com
      userEvent.click(button)
      //this failure text was set at very top in server setup
      const errorMessage = await screen.findByText('Incorrect credentials')
      expect(errorMessage).toBeInTheDocument()
    })
    it('clears authentication fail message when email field is changed', async () => {
      setup()
      userEvent.click(button)
      const errorMessage = await screen.findByText('Incorrect credentials')
      userEvent.type(emailInput, 'new@mail.com')
      expect(errorMessage).not.toBeInTheDocument()
    })
    it('clears authentication fail message when password field is changed', async () => {
      setup()
      userEvent.click(button)
      const errorMessage = await screen.findByText('Incorrect credentials')
      userEvent.type(passwordInput, 'newP4ss')
      expect(errorMessage).not.toBeInTheDocument()
    })
    it('stores id, username and image in storage', async () => {
      server.use(loginSuccess)
      setup('user5@mail.com')
      userEvent.click(button)
      const spinner = screen.queryByRole('status')
      await waitForElementToBeRemoved(spinner)
      //??where/when do we se SET the LS?
      const storedState = storage.getItem('auth')
      const objectFields = Object.keys(storedState)

      expect(objectFields.includes('id')).toBeTruthy()
      expect(objectFields.includes('username')).toBeTruthy()
      expect(objectFields.includes('image')).toBeTruthy()
    })
    it('stores authorization header value in storage', async () => {
      server.use(loginSuccess)
      setup('user5@mail.com')
      userEvent.click(button)
      const spinner = screen.queryByRole('status')
      await waitForElementToBeRemoved(spinner)
      const storedState = storage.getItem('auth')
      //this is the token we set up in loginSuccess()
      expect(storedState.header).toBe('Bearer abcdefgh')
    })
  })
})
