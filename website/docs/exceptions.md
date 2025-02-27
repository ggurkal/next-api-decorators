---
title: Exceptions
slug: /exceptions
---

The following common exceptions are provided by this package.

|                                | Status code | Default message           |
| ------------------------------ | ----------- | ------------------------- |
| `BadRequestException`          | `400`       | `'Bad Request'`           |
| `UnauthorizedException`        | `401`       | `'Unauthorized'`          |
| `NotFoundException`            | `404`       | `'Not Found'`             |
| `PayloadTooLargeException`     | `413`       | `'Payload Too Large'`     |
| `UnprocessableEntityException` | `422`       | `'Unprocessable Entity'`  |
| `InternalServerErrorException` | `500`       | `'Internal Server Error'` |

### Custom exceptions

Any exception class that extends the base `HttpException` will be handled by the built-in error handler.

```ts
import { HttpException } from '@storyofams/next-api-decorators';

export class ForbiddenException extends HttpException {
  public constructor(message?: string = 'Forbidden') {
    super(403, message);
  }
}
```

Then later in the app, we can use it in our route handler:

```ts
class Events {
  @Get()
  public events() {
    throw new ForbiddenException();
  }
}
```

### Handling exceptions

Even though we already have a built-in exception handler, you may need more control over the exception handling for specific use cases. For example, add logging or use a different shape for the response object based on some dynamic factors. For that purpose, we provide the `@Catch` decorator.

`@Catch` decorator can either be used for the whole handler (on the class) or can be used for a specific route (on a class method).

Let's create an exception handler for the `ForbiddenException` we created above.

```ts
import { Catch } from '@storyofams/next-api-decorators';

function forbiddenExceptionHandler(
  error: ForbiddenException,
  req: NextApiRequest,
  res: NextApiResponse
) {
  Sentry.captureException(err);
  res.status(403).end();
}

@Catch(forbiddenExceptionHandler, ForbiddenException)
class Events {
  @Get()
  public events() {
    return 'Our events';
  }
}
```

### Catch everything

In case you need the exception handler to catch all errors, you can pass only the handler function to the `@Catch` decorator:

```ts
import { Catch } from '@storyofams/next-api-decorators';

function exceptionHandler(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred.';
  res.status(200).json({ success: false, error: message });
}

@Catch(exceptionHandler)
class Events {
  @Get()
  public events() {
    return 'Our events';
  }
}
```
