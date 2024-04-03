import { startRemoteDebugger } from 'bun:jsc'
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
    const exists = TODOS.filter((x) => x.id === params.id)
    if(!exists.length) {
      return error(404, "Todo not found for deletion")
    }
    TODOS = local
    return {
      message: "Deletion successful"
    }
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
      lastId += 1
      const newTodo = {
        id: lastId,
        ...body
      }
      TODOS = [newTodo, ...TODOS]
      return newTodo
    },
    {
      body : t.Object({
        starred: t.Boolean(),
        completed: t.Boolean(),
        desc: t.String()
      })
    }
  )
  .put(
    '/todos/:id',
    ({params, body, error}) => {
      const local = TODOS.filter((x)=>x.id !== params.id)
      const exists = TODOS.filter((x) => x.id === params.id)
      if(!exists.length) return error(404, "Todo not found for editing")
      console.log(local)
      TODOS = [body, ...local]
      return body
    },
    {
      params: t.Object({
        id: t.Numeric()
      }),
      body : t.Object({
        id: t.Numeric(),
        starred: t.Boolean(),
        completed: t.Boolean(),
        desc: t.String()
      })
    }
  )
  .patch(
    '/todos/:id',
    ({ params, body, error }) => {
      const todoIndex = TODOS.findIndex(todo => todo.id === params.id);
      if (todoIndex === -1) {
        return error(404, "Todo not found");
      } else {
        TODOS[todoIndex] = { ...TODOS[todoIndex], ...(body as Partial<{
          id: number;
          starred: boolean;
          completed: boolean;
          desc: string;
        }>) };
        return TODOS[todoIndex];
      }
    }, 
    {
      params: t.Object({
        id: t.Numeric()
      }), 
      body: t.Unknown()
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
 * POST /todos - done
 * PUT /todos/1234321 {} -done
 * PATCH /todos/12312312 {} 
 * DELETE /todos/1231231 - done
 */
