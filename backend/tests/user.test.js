const jwt = require('jsonwebtoken')
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const Goal = require('../models/goalModel')

require('dotenv').config()

let userPayload = {
  username: 'Scott Doe',
  email: 'sdoe@ex.com',
  password: 'P4ssword',
}

let userCreated

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

describe('user endpoint tests', () => {
  beforeAll(async () => {
    // await mongoose.connection.close()
    await mongoose.connect(process.env.MONGO_URI)
    await User.deleteMany()
    await Goal.deleteMany()
  })

  /* Dropping the database and closing connection after each test. */
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('POST /api/users', () => {
    test('successfully registers a new user', async () => {
      const res = await request(app).post('/api/users/').send(userPayload)

      userCreated = res.body
      // console.log('userCreated', userCreated)

      expect(res.statusCode).toBe(200)
      expect(res.body).toMatchObject(
        expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          // token: expect.any(String),
        })
      )
    })

    test('using an existing email', async () => {
      const res = await request(app).post('/api/users/').send(userPayload)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('User already exists')
    })

    test('using invalid form data', async () => {
      //user does not supply pw here
      let userData = {
        username: 'Tom Doe',
        email: 'Tom@ex.com',
      }

      const res = await request(app).post('/api/users/').send(userData)

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/users/auth', () => {
    test('successfully authenticates a user', async () => {
      let userData = {
        email: userPayload.email,
        password: userPayload.password,
      }

      const res = await request(app).post('/api/users/auth').send(userData)

      expect(res.statusCode).toBe(200)

      expect(res.body).toMatchObject(
        expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          token: expect.any(String),
        })
      )
    })

    test('invalid credentials used', async () => {
      let userData = {
        email: userPayload.email,
        password: 'asdfasdf', //incorrect password
      }

      const res = await request(app).post('/api/users/auth').send(userData)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Invalid credentials')
    })
  })
})

/*

NOTES:

-jest cheatsheet

https://github.com/sapegin/jest-cheat-sheet


-200 or 201 response for POST and PUT requests?
  ->use 200 for now...
https://stackoverflow.com/questions/1860645/create-request-with-post-which-response-codes-200-or-201-and-content#:~:text=200%20when%20an%20object%20is%20created%20and%20returned
*/
