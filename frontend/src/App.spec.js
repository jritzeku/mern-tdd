import { render, screen } from './test/setup'
import App from './App'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import storage from './state/storage'

let logoutCount = 0
let header
const server = setupServer(
  //Here we set up our dummy backend API responses for each

  //activate
  //   rest.post('/api/1.0/users/token/:token', (req, res, ctx) => {
  //     return res(ctx.status(200))
  //   }),

  rest.post('/api/users/auth', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 5, username: 'user5' }))
  }),
  //   rest.post('/api/1.0/logout', (req, res, ctx) => {
  //     logoutCount += 1
  //     return res(ctx.status(200))
  //   }),

  //Goal routes
  rest.get('/api/goals', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        content: [
          {
            id: 1,
            title: 'goal1',
            user: 5,
          },
        ],
      })
    )
  }),
  rest.get('/api/goals/:id', (req, res, ctx) => {
    header = req.headers.get('Authorization')
    //goal id
    const id = Number.parseInt(req.params.id)

    if (id === 1) {
      return res(
        ctx.json({
          id: 1,
          title: 'goal1',
          user: 5,
        })
      )
    }
    //??
    return res(
      ctx.json({
        id: id,
        username: 'user' + id,
        email: 'user' + id + '@mail.com',
        image: null,
      })
    )
  }),
  rest.delete('/api/goals/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  })
)

beforeEach(() => {
  logoutCount = 0
  server.resetHandlers()
})

const originalWarn = console.warn.bind(console.warn)
beforeAll(() =>  {
  console.warn = (msg) => 
    !msg.toString().includes('componentWillReceiveProps') && originalWarn(msg)
  server.listen()

})

afterAll(() => server.close())

const setup = (path) => {
  window.history.pushState({}, '', path)
  render(<App />)
}

describe('Routing', () => {
  it.each`
    path         | pageTestId
    ${'/'}       | ${'home-page'}
    ${'/signup'} | ${'signup-page'}
    ${'/login'}  | ${'login-page'}
    ${'/goal/1'} | ${'goal-page'}
    ${'/goal/2'} | ${'goal-page'}
  `('displays $pageTestId when path is $path', ({ path, pageTestId }) => {
    setup(path) //navigate to the page
    const page = screen.queryByTestId(pageTestId)
    expect(page).toBeInTheDocument()
  })

  it.each`
    targetPage
    ${'Goalify'}
    ${'Sign Up'}
    ${'Login'}
  `('has link to $targetPage on NavBar', ({ targetPage }) => {
    setup('/')
    const link = screen.getByRole('link', { name: targetPage })
    expect(link).toBeInTheDocument()
  })

  it.each`
    initialPath  | clickingTo   | visiblePage
    ${'/'}       | ${'Sign Up'} | ${'signup-page'}
    ${'/signup'} | ${'Goalify'} | ${'home-page'}
    ${'/signup'} | ${'Login'}   | ${'login-page'}
  `(
    'displays $visiblePage after clicking $clickingTo',
    ({ initialPath, clickingTo, visiblePage }) => {
      setup(initialPath)
      const link = screen.getByRole('link', { name: clickingTo })
      userEvent.click(link)
      expect(screen.getByTestId(visiblePage)).toBeInTheDocument()
    }
  )

  it('displays home page when clicking brand logo', () => {
    setup('/login')
    // const logo = screen.queryByAltText('Hoaxify')

    const logo = screen.getByRole('link', { name: 'Goalify' })
    userEvent.click(logo)
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

 
})

describe('Login', () => {
  const setupLoggedIn = () => {
    //simulate succssful login
    setup('/login')
    userEvent.type(screen.getByLabelText('E-mail'), 'user5@mail.com')
    userEvent.type(screen.getByLabelText('Password'), 'P4ssword')
    userEvent.click(screen.getByRole('button', { name: 'Login' }))
  }

  it('redirects to homepage after successful login', async () => {
    setupLoggedIn()
    const page = await screen.findByTestId('home-page')
    expect(page).toBeInTheDocument()
  })

  it('hides Login and Sign Up from navbar after successful login', async () => {
    setupLoggedIn()
    await screen.findByTestId('home-page')
    const loginLink = screen.queryByRole('link', { name: 'Login' })
    const signUpLink = screen.queryByRole('link', { name: 'Sign Up' })
    // const logoutLink = screen.queryByRole('link', { name: 'Logout' })
    expect(loginLink).not.toBeInTheDocument()
    expect(signUpLink).not.toBeInTheDocument()
    // expect(logoutLink).toBeInTheDocument()
  })

  //NOTE: diff from orig.
  it('displays Add Goal link on navbar after successful login', async () => {
    //for this we have to start with out logged in first
    setup('/login')

    const addGoalLinkBeforeLogin = screen.queryByRole('link', {
      name: 'Add Goal',
    })
    expect(addGoalLinkBeforeLogin).not.toBeInTheDocument()
    userEvent.type(screen.getByLabelText('E-mail'), 'user5@mail.com')
    userEvent.type(screen.getByLabelText('Password'), 'P4ssword')
    userEvent.click(screen.getByRole('button', { name: 'Login' }))
    await screen.findByTestId('home-page')
    //why not re-use same profile link above? tried didnt work
    const addGoalLinkAfterLogin = screen.queryByRole('link', {
      name: 'Add Goal',
    })
    expect(addGoalLinkAfterLogin).toBeInTheDocument()
  })

  //NOTE: diff from orig.
  it('displays Add Goal page with in url after clicking Add Goal link', async () => {
    setupLoggedIn()
    await screen.findByTestId('home-page')
    const addGoalLink = screen.queryByRole('link', {
      name: 'Add Goal',
    })
    userEvent.click(addGoalLink)
    //display user page
    // await screen.findByTestId('user-page')
    expect(
      screen.queryByRole('heading', { name: 'Add a Goal' })
    ).toBeInTheDocument()
  })
  it('stores logged in state in local storage', async () => {
    setupLoggedIn()
    await screen.findByTestId('home-page')
    const state = storage.getItem('auth')
    //isLoggedIn is from store
    expect(state.isLoggedIn).toBeTruthy()
  })
  it('displays layout of logged in state', () => {
    storage.setItem('auth', { isLoggedIn: true })
    setup('/')
    const myProfileLink = screen.queryByRole('link', {
      name: 'Add Goal',
    })
    expect(myProfileLink).toBeInTheDocument()
  })
})

describe('Logout', () => {
  let logoutLink

  const setupLoggedIn = () => {
    storage.setItem('auth', {
      id: 5,
      isLoggedIn: true,
      header: 'auth header value',
    })
    setup('/')
    logoutLink = screen.queryByRole('link', {
      name: 'Logout',
    })
  }

  it('displays Logout link on navbar after successful login', () => {
    setupLoggedIn()
    expect(logoutLink).toBeInTheDocument()
  })

  it('does not display logout link after logging out', () => {
    setupLoggedIn()
    userEvent.click(logoutLink)
    expect(logoutLink).not.toBeInTheDocument()
  })

  it('displays login and sign up on navbar after clicking logout', () => {
    setupLoggedIn()
    userEvent.click(logoutLink)
    const loginLink = screen.queryByRole('link', { name: 'Login' })
    expect(loginLink).toBeInTheDocument()
  })


})


describe('Delete Goal', () => { 
    let deleteButton
    const setupLoggedInUserPage = async () => {
      storage.setItem('auth', {
        id: 5,
 
        isLoggedIn: true,
        header: 'auth header value',
      })
      setup('/user/5')
      deleteButton = await screen.findByRole('button', {
        name: 'Delete My Account',
      })
    }


})