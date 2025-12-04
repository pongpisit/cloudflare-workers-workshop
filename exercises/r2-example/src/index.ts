/**
 * R2 File Upload API - Exercise Solution
 * 
 * A complete file upload API using Cloudflare R2.
 */

export interface Env {
  BUCKET: R2Bucket;
  MAX_FILE_SIZE: string;
}

interface FileMetadata {
  key: string;
  size: number;
  uploaded: string;
  contentType: string;
  customMetadata?: Record<string, string>;
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
      'Access-Control-Allow-Headers': 'Content-Type, X-Custom-Metadata',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /upload - Upload a file
      if (path === '/upload' && method === 'POST') {
        const contentType = request.headers.get('content-type') || '';
        
        // Handle multipart form data
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          
          if (!file) {
            return Response.json(
              { error: 'No file provided' },
              { status: 400, headers: corsHeaders }
            );
          }

          // Check file size
          const maxSize = parseInt(env.MAX_FILE_SIZE || '10485760');
          if (file.size > maxSize) {
            return Response.json(
              { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
              { status: 400, headers: corsHeaders }
            );
          }

          // Generate unique key
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const extension = file.name.split('.').pop() || '';
          const key = `uploads/${timestamp}-${randomId}.${extension}`;

          // Upload to R2
          await env.BUCKET.put(key, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
            },
          });

          return Response.json({
            success: true,
            key: key,
            originalName: file.name,
            size: file.size,
            contentType: file.type,
          }, { status: 201, headers: corsHeaders });
        }

        // Handle raw binary upload
        const filename = url.searchParams.get('filename') || 'file';
        const key = `uploads/${Date.now()}-${filename}`;

        await env.BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: contentType || 'application/octet-stream',
          },
        });

        return Response.json({
          success: true,
          key: key,
        }, { status: 201, headers: corsHeaders });
      }

      // GET /files - List all files
      if (path === '/files' && method === 'GET') {
        const prefix = url.searchParams.get('prefix') || 'uploads/';
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const cursor = url.searchParams.get('cursor') || undefined;

        const listed = await env.BUCKET.list({
          prefix,
          limit,
          cursor,
        });

        const files: FileMetadata[] = listed.objects.map((obj: R2Object) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded.toISOString(),
          contentType: obj.httpMetadata?.contentType || 'unknown',
          customMetadata: obj.customMetadata,
        }));

        return Response.json({
          files,
          truncated: listed.truncated,
          cursor: listed.truncated ? listed.cursor : undefined,
        }, { headers: corsHeaders });
      }

      // GET /files/:key - Download a file
      if (path.startsWith('/files/') && method === 'GET') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        const object = await env.BUCKET.get(key, {
          range: request.headers,
          onlyIf: request.headers,
        });

        if (object === null) {
          return Response.json(
            { error: 'File not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        
        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });

        // Handle range requests
        if (object.range) {
          const { offset, length } = object.range as { offset: number; length: number };
          headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
          headers.set('content-length', length.toString());
          return new Response(object.body, { status: 206, headers });
        }

        return new Response(object.body, { headers });
      }

      // HEAD /files/:key - Get file metadata
      if (path.startsWith('/files/') && method === 'HEAD') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        const head = await env.BUCKET.head(key);

        if (head === null) {
          return new Response(null, { status: 404, headers: corsHeaders });
        }

        const headers = new Headers(corsHeaders);
        headers.set('content-length', head.size.toString());
        headers.set('content-type', head.httpMetadata?.contentType || 'application/octet-stream');
        headers.set('etag', head.httpEtag);
        headers.set('last-modified', head.uploaded.toUTCString());

        return new Response(null, { headers });
      }

      // DELETE /files/:key - Delete a file
      if (path.startsWith('/files/') && method === 'DELETE') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        // Check if file exists
        const head = await env.BUCKET.head(key);
        if (head === null) {
          return Response.json(
            { error: 'File not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        await env.BUCKET.delete(key);

        return Response.json({
          success: true,
          message: 'File deleted',
          key: key,
        }, { headers: corsHeaders });
      }

      // Root path - API info
      if (path === '/' || path === '') {
        return Response.json({
          name: 'File Upload API',
          version: '1.0.0',
          endpoints: {
            'POST /upload': 'Upload a file (multipart/form-data or raw binary)',
            'GET /files': 'List all files',
            'GET /files/:key': 'Download a file',
            'HEAD /files/:key': 'Get file metadata',
            'DELETE /files/:key': 'Delete a file',
          },
          limits: {
            maxFileSize: `${parseInt(env.MAX_FILE_SIZE || '10485760') / 1024 / 1024}MB`,
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
