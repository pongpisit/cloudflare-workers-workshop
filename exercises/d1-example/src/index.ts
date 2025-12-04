/**
 * D1 Todo API - Exercise Solution
 * 
 * A complete CRUD API for managing todos using Cloudflare D1.
 */

export interface Env {
  DB: D1Database;
}

interface Todo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /todos - List all todos
      if (path === '/todos' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM todos ORDER BY created_at DESC')
          .all<Todo>();

        return Response.json(results, { headers: corsHeaders });
      }

      // POST /todos - Create a new todo
      if (path === '/todos' && method === 'POST') {
        const body = await request.json() as { title: string };
        
        if (!body.title || body.title.trim() === '') {
          return Response.json(
            { error: 'Title is required' },
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await env.DB
          .prepare('INSERT INTO todos (title) VALUES (?)')
          .bind(body.title.trim())
          .run();

        const newTodo = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(result.meta.last_row_id)
          .first<Todo>();

        return Response.json(newTodo, { 
          status: 201, 
          headers: corsHeaders 
        });
      }

      // GET /todos/:id - Get a single todo
      if (path.match(/^\/todos\/\d+$/) && method === 'GET') {
        const id = path.split('/')[2];
        
        const todo = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!todo) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        return Response.json(todo, { headers: corsHeaders });
      }

      // PUT /todos/:id - Update a todo
      if (path.match(/^\/todos\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[2];
        const body = await request.json() as { title?: string; completed?: boolean };

        // Check if todo exists
        const existing = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!existing) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | number)[] = [];

        if (body.title !== undefined) {
          updates.push('title = ?');
          values.push(body.title);
        }
        if (body.completed !== undefined) {
          updates.push('completed = ?');
          values.push(body.completed ? 1 : 0);
        }

        if (updates.length > 0) {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id);

          await env.DB
            .prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run();
        }

        const updated = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        return Response.json(updated, { headers: corsHeaders });
      }

      // DELETE /todos/:id - Delete a todo
      if (path.match(/^\/todos\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];

        const existing = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!existing) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        await env.DB
          .prepare('DELETE FROM todos WHERE id = ?')
          .bind(id)
          .run();

        return Response.json(
          { success: true, message: 'Todo deleted' },
          { headers: corsHeaders }
        );
      }

      // Root path - API info
      if (path === '/' || path === '') {
        return Response.json({
          name: 'Todo API',
          version: '1.0.0',
          endpoints: {
            'GET /todos': 'List all todos',
            'POST /todos': 'Create a new todo',
            'GET /todos/:id': 'Get a single todo',
            'PUT /todos/:id': 'Update a todo',
            'DELETE /todos/:id': 'Delete a todo',
          },
        }, { headers: corsHeaders });
      }

      return Response.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders }
      );

    } catch (error) {
      console.error('Error:', error);
      return Response.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
