import type { RequestHandler } from 'express';
import { HttpError } from './http-error.ts';

/** Mounted after every API route, so it only runs when nothing else matched. */
export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, 'NOT_FOUND', `No route for ${request.method} ${request.originalUrl}`));
};
