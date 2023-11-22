const jwt = require('jsonwebtoken')
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const Goal = require('../models/goalModel')

require('dotenv').config()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

let userCreated, userCreated2
let goalCreated, goalCreated2

let goalPayload = {
  title: 'Get a junior dev job by September 2023',
}

let userPayload = {
  username: 'John Doe',
  email: 'jdoe@ex.com',
  password: 'P4ssword',
}

let userPayload2 = {
  username: 'Tom Doe',
  email: 'tdoe@ex.com',
  password: 'P4ssword',
}


 
describe('goal endpoint tests', () => {
  beforeAll(async () => {
    // await mongoose.connection.close()
    await mongoose.connect(process.env.MONGO_URI)
    await User.deleteMany()
    await Goal.deleteMany()

    userCreated = await User.create(userPayload)
    userCreated2 = await User.create(userPayload2)

    goalCreated = await Goal.create({
      title: 'Get a junior dev job by September 2023',
      user: userCreated._id,
    })

    goalCreated2 = await Goal.create({
      title: 'Become a fitness trainer for NFl athletes',
      user: userCreated2._id,
    })
  })

  /* Dropping the database and closing connection after each test. */
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('POST /api/goals', () => {
    test('successfully create a new goal', async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .post('/api/goals')

        .set('Authorization', `Bearer ${jwt}`)
        .send({ title: 'Become an accountant at Target' })

      expect(res.statusCode).toBe(200)
      expect(res.body).toMatchObject(
        expect.objectContaining({
          _id: expect.any(String),
          user: expect.any(String),
          title: expect.any(String),
          createdAt: expect.any(String),
        })
      )
    })

    test('invalid input/title supplied', async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .post('/api/goals')

        .set('Authorization', `Bearer ${jwt}`)
        .send({
          title: '',
        })

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Please add a title')
    })
  })

  describe('GET /api/goals', () => {
    test('successfully fetch goals', async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .get('/api/goals/')
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.statusCode).toBe(200)

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            user: expect.any(String),
            title: expect.any(String),
            createdAt: expect.any(String),
          }),
        ])
      )
    })
  })

  describe('PUT /api/goals/:id', () => {
    test('successfully edit a goal', async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .put(`/api/goals/${goalCreated._id.toString()}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          title: 'Edited goal!',
        })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('title', 'Edited goal!')
    })

    test('pass an invalid goal id', async () => {
      const jwt = generateToken(userCreated._id)

      //NOTE: need to use id that meets mongodb resource id  criteria
      const mongoId = new mongoose.Types.ObjectId().toString()

      const res = await request(app)
        .put(`/api/goals/${mongoId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          title: 'Edited goal!',
        })

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Goal not found')
    })

    test("attempt to edit someone else's goal", async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .put(`/api/goals/${goalCreated2._id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          title: 'Edited goal!',
        })

      expect(res.statusCode).toBe(401)
      expect(res.body.message).toBe('User not authorized')
    })
  })

  describe('DELETE /api/goals/:id', () => {
    test('successfully delete a goal', async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .put(`/api/goals/${goalCreated._id.toString()}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          title: 'Edited goal!',
        })

      expect(res.statusCode).toBe(200)
    })

    test('pass an invalid goal id', async () => {
      const jwt = generateToken(userCreated._id)

      //NOTE: need to use id that meets mongodb resource id  criteria
      const mongoId = new mongoose.Types.ObjectId().toString()

      const res = await request(app)
        .delete(`/api/goals/${mongoId}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toBe('Goal not found')
    })

    test("attempt to delete someone else's goal", async () => {
      const jwt = generateToken(userCreated._id)

      const res = await request(app)
        .delete(`/api/goals/${goalCreated2._id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.statusCode).toBe(401)
      expect(res.body.message).toBe('User not authorized')
    })
  })
})
