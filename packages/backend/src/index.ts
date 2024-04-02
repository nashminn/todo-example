import { Elysia, t } from 'elysia'

let lastId = 2

// replacing const with let
let TODOS = [
  {
    id: 1,
    starred: false,
    completed: false,
    desc: 'Wake up at 5am'
  },
  {
    id: 2,
    starred: false,
    completed: false,
    desc: 'Brush your teeth'
  }
]

const app = new Elysia()
  .get('/', ()=>[
    {
      'get /': 'here',
      'get /todos': 'gets all todos',
      'get /todos/:id': 'gets todo with id',
      'post /todos': 'sends new todo'
    }
  ])
  .get('/todos', () => TODOS)
  .get(
    '/todos/:id',
    ({ params, error }) => {
      const todo = TODOS.find((todo) => todo.id === params.id)
      if (!todo) {
        return error(404)
      }
      return todo
    },
    {
      params: t.Object({
        id: t.Numeric()
      })
    }
  )
  .delete('/todos/:id', 
  ({params, error}) => {
    const local = TODOS.filter((x)=>x.id !== params.id)
    console.log(local)
    TODOS = local
  },
  {
    params: t.Object({
      id: t.Numeric()
    })
  })
  .post(
    '/todos',
    // ↓ hover me ↓
    ({ body }) => {
      console.log(body)
      return body
    },
    {
      body : t.Object({
        id: t.Numeric(),
        starred: t.Boolean(),
        completed: t.Boolean(),
        desc: t.String()
      })
    }
  )
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

app.handle(new Request('http://localhost:3000/'))
   .then(console.log)
  
/*
 * GET /todos
 * GET /todos/123421
 * POST /todos
 * PUT /todos/1234321 {}
 * PATCH /todos/12312312 {}
 * DELETE /todos/1231231
 */
