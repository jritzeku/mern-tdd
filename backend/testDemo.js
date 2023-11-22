//'supertest' enables us to programmatically send HTTP requests for testing
const request = require('supertest')
const app = require('./app')

describe('Todos API', () => {
  it('GET /todos --> array todos', () => {
    //simulating a fake request by passing app as arg
    return request(app)
      .get('/todos')
      .expect('Content-Type', /json/) //the content type exepct
      .expect(200) //status code expected
      .then((response) => {
        //API call returns Promise so we handle it here...
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              completed: expect.any(Boolean),
            }),
          ])
        )
      })
  })

  it('GET /todos/id --> specific todo by id', () => {
    return request(app)
      .get('/todos/1') //assume is valid id for task
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ 
            id: expect.any(Number),
            name: expect.any(String),
            completed: expect.any(Boolean),
          })
        )
      })
  })

  it('GET /todos/id --> 404 if not found', () => {
    return request(app)
      .get('/todos/99999') //assume this  is invalid id for todo task
      .expect(404)
  })

  it('POST /todos --> created todo', () => {
    return request(app)
      .post('/todos')
      .send({
        //for POST/PUT, can use send() which allows us to create mock request body
        name: 'do dishes',
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            name: 'do dishes',
            completed: false, //initially ,result is false
          })
        )
      })
  })

  it('POST /todos --> validates request body', () => {
    return request(app)
      .post('/todos')
      .send({ name: 123 }) //here we provide invalid task via number instead of string

      .expect(422) //Error 422 is an HTTP code when server can't process your request, although it understands it.
  })
})
