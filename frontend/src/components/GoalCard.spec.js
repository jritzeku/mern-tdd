import GoalCard from './GoalCard'
import { render, screen, waitForElementToBeRemoved } from '../test/setup'
import storage from '../state/storage'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import GoalList from './GoalList'

let count, goalId, requestBody, header
const server = setupServer(
  rest.put('/api/goals/:id', (req, res, ctx) => {
    count += 1
    goalId = req.params.id
    requestBody = req.body
    header = req.headers.get('Authorization')
    return res(ctx.status(200))
  }),
  rest.delete('/api/goals/:id', (req, res, ctx) => {
    goalId = req.params.id
    header = req.headers.get('Authorization')
    return res(ctx.status(200))
  })
)


beforeEach(() => {
  count = 0
  goalId = 0
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Goal Card', () => {
  let testGoal = {
    id: 1,
    user: 5,
    title: 'goal1',
  }

  const setup = (user = { id: 5 }) => {
    storage.setItem('auth', {
      id: user.id,

      header: 'auth header value',
    })
    render(<GoalCard goal={testGoal} />)
  }

  let saveButton

  //set up for when we are editing profile
  const setupInEditMode = () => {
    setup()
    userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    saveButton = screen.getByRole('button', { name: 'Save' })
  }

  it('displays edit button when logged in user is shown on card', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('does not display edit button for another user', () => {
    setup({ id: 2 })
    expect(
      screen.queryByRole('button', { name: 'Edit' })
    ).not.toBeInTheDocument()
  })

  it('displays input for goal title after clicking edit', () => {
    setup()
    expect(screen.queryByLabelText('Change your goal')).not.toBeInTheDocument()
    userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.queryByLabelText('Change your goal')).toBeInTheDocument()
  })
  it('displays save and cancel buttons in edit mode', () => {
    setup()
    userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('hides Edit button and goal title header in edit mode', () => {
    setup()
    userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(
      screen.queryByRole('button', { name: 'Edit' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'goal1' })
    ).not.toBeInTheDocument()
  })

  it('has the current goal title in input', () => {
    setup()
    userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const input = screen.queryByLabelText('Change your goal')
    expect(input).toHaveValue('goal1')
  })

  it('displays spinner during api call', async () => {
    setupInEditMode()
    userEvent.click(saveButton)
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
  })
  it('disables the save button during api call', async () => {
    setupInEditMode()
    userEvent.click(saveButton)
    userEvent.click(saveButton)
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
    expect(count).toBe(1)
  })

 

  it('sends request with body having updated username', async () => {
    setupInEditMode()
    const editInput = screen.getByLabelText('Change your goal')
    userEvent.clear(editInput)
    userEvent.type(editInput, 'goal1-updated')
    userEvent.click(saveButton)
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
    expect(requestBody).toEqual({ title: 'goal1-updated' })
  })

  it('sends request with authorization header', async () => {
    setupInEditMode()
    userEvent.click(saveButton)
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
    expect(header).toBe('auth header value')
  })

  it('sends request with body having goal title even if user does not update it', async () => {
    setupInEditMode()
    userEvent.click(saveButton)
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
    expect(requestBody).toEqual({ title: 'goal1' })
  })
  it('hides edit layout after successful update', async () => {
    setupInEditMode()
    userEvent.click(saveButton)
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    //recall that edit layout only has 'save' and 'cancel' button
    expect(editButton).toBeInTheDocument()
  })

  it('displays last updated name in input in edit mode after successful username update', async () => {
    setupInEditMode()
    let editInput = screen.getByLabelText('Change your goal')
    userEvent.clear(editInput)
    userEvent.type(editInput, 'new-goal')
    userEvent.click(saveButton)
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    userEvent.click(editButton)
    //duplicate assignment??
    editInput = screen.getByLabelText('Change your goal')
    expect(editInput).toHaveValue('new-goal')
  })

  it('hides edit layout after clicking cancel', async () => {
    setupInEditMode()
    userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeInTheDocument()
  })

  it('displays the original username after username is changed in edit mode but cancelled', async () => {
    setupInEditMode()
    let editInput = screen.getByLabelText('Change your goal')
    userEvent.clear(editInput)
    //this value is not preserved since we cancel
    userEvent.type(editInput, 'new-goal')
    userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    const header = screen.getByRole('heading', { name: 'goal1' })
    expect(header).toBeInTheDocument()
  })

 

  it('displays modal after clicking delete', () => {
    setup()
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    const deleteButton = screen.queryByRole('button', {
      name: 'Delete',
    })
    userEvent.click(deleteButton)
    const modal = screen.queryByTestId('modal')
    expect(modal).toBeInTheDocument()
  })

  it('displays confirmation question with cancel and confirm buttons', () => {
    setup()
    const deleteButton = screen.queryByRole('button', {
      name: 'Delete',
    })
    userEvent.click(deleteButton)
    expect(
      screen.queryByText('Are you sure to delete your goal?')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    //this is our confirm button
    expect(screen.queryByRole('button', { name: 'Yes' })).toBeInTheDocument()
  })

  it('removes modal after clicking cancel', () => {
    setup()
    const deleteButton = screen.queryByRole('button', {
      name: 'Delete',
    })
    userEvent.click(deleteButton)
    userEvent.click(screen.queryByRole('button', { name: 'Cancel' }))
    const modal = screen.queryByTestId('modal')
    expect(modal).not.toBeInTheDocument()
  })

  it('displays spinner while delete api call in progress', async () => {
    setup()
    const deleteButton = screen.queryByRole('button', {
      name: 'Delete',
    })
    userEvent.click(deleteButton)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    userEvent.click(screen.queryByRole('button', { name: 'Yes' }))
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
  })

  it('sends authorization header in delete api call', async () => {
    setup()
    const deleteButton = screen.queryByRole('button', {
      name: 'Delete',
    })
    userEvent.click(deleteButton)
    userEvent.click(screen.queryByRole('button', { name: 'Yes' }))
    const spinner = screen.getByRole('status')
    await waitForElementToBeRemoved(spinner)
    expect(header).toBe('auth header value')
  })
})
