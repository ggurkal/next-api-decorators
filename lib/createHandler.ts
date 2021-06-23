import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { findRoute } from './internals/findRoute';
import { getParams } from './internals/getParams';
import { notFound } from './internals/notFound';
import { parseRequestUrl } from './internals/parseRequestUrl';

interface CreateHandlerOptions {
  /**
   * Directory path of the handler file. Directly pass the internal `__dirname`.
   */
  directoryPath?: string;
}

/**
 * Prepares a router for the given class.
 *
 * @param cls Router class
 *
 * @example
 * ```ts
 * import { createHandler, Get } from '@storyofams/next-api-decorators';
 *
 * class Events {
 *  Get()
 *  public events() {
 *    return DB.findEvents();
 *  }
 * }
 *
 * export default createHandler(Events);
 * ```
 */
export function createHandler(cls: new (...args: any[]) => any, options?: CreateHandlerOptions): NextApiHandler {
  const instance = new cls();

  return (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.url || !req.method) {
      return notFound(req, res);
    }

    const path = parseRequestUrl(req.url, options?.directoryPath);
    const [keys, match, method] = findRoute(cls, req.method, path);
    if (!method) {
      return notFound(req, res);
    }

    const methodFn = instance[method.propertyKey];
    if (!methodFn) {
      return notFound(req, res);
    }

    req.params = getParams(keys, match);

    return methodFn.call(instance, req, res);
  };
}
