/**
 * Hello World Worker - Exercise Solutions
 * 
 * This file contains solutions for Module 2 exercises.
 * Try to complete the exercises yourself before looking at these solutions!
 */

// Exercise 1: JSON API Response
export const jsonApiHandler = {
  async fetch(request, env, ctx) {
    const data = {
      message: 'Hello from Cloudflare Workers!',
      timestamp: new Date().toISOString(),
      location: 'Edge Network',
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'content-type': 'application/json',
      },
    });
  },
};

// Exercise 2: Route Handler
export const routeHandler = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (path) {
      case '/':
        return new Response('Welcome to my Worker!');
      
      case '/hello':
        return new Response('Hello, World!');
      
      case '/time':
        return new Response(`Current time: ${new Date().toISOString()}`);
      
      case '/json':
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'content-type': 'application/json' },
        });
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};

// Exercise 3: Request Information
export const requestInfoHandler = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const info = {
      method: request.method,
      url: request.url,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(request.headers),
      cf: request.cf, // Cloudflare-specific request properties
    };

    return new Response(JSON.stringify(info, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  },
};

// Default export - combines all exercises
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Route to different exercise handlers
    if (url.pathname.startsWith('/exercise1')) {
      return jsonApiHandler.fetch(request, env, ctx);
    }
    
    if (url.pathname.startsWith('/exercise2')) {
      // Remove /exercise2 prefix for the route handler
      const modifiedUrl = new URL(request.url);
      modifiedUrl.pathname = url.pathname.replace('/exercise2', '') || '/';
      const modifiedRequest = new Request(modifiedUrl, request);
      return routeHandler.fetch(modifiedRequest, env, ctx);
    }
    
    if (url.pathname.startsWith('/exercise3')) {
      return requestInfoHandler.fetch(request, env, ctx);
    }
    
    // Default response
    return new Response(`
      Hello World Worker - Exercise Solutions
      
      Available endpoints:
      - /exercise1 - JSON API Response
      - /exercise2/* - Route Handler (try /exercise2/hello, /exercise2/time, /exercise2/json)
      - /exercise3 - Request Information
    `, {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
