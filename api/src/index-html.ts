import path from 'node:path';
import type { RequestHandler } from 'express';

/**
 * Angular's routes exist only in the browser, so a reload on /exercises must answer with index.html. nginx serves
 * the real files before a request reaches the app; a path with an extension that gets here is a missing file and
 * falls through to a 404. index.html is never cached, so a deploy's new script names reach the browser at once.
 */
export function serveIndexHtml(indexHtmlPath: string): RequestHandler {
  return (request, response, next) => {
    const isPageRequest = request.method === 'GET' || request.method === 'HEAD';
    if (!isPageRequest || path.extname(request.path) !== '') {
      next();
      return;
    }
    response.setHeader('Cache-Control', 'no-cache');
    response.sendFile(indexHtmlPath);
  };
}
