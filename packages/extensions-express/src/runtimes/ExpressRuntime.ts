import {
  Guid,
  GuidExtensions,
  IProcessor,
  NotFoundError,
  TimestampExtensions,
  UnauthorizedError,
  ValidationError,
} from "@tsukiy0/extensions-core";
import { RequestHandler, Response } from "express";
import { promisifyHandler } from "../helpers/promisifyHandler";
import { ValidationError as RuntypesValidationError } from "runtypes";

export class ExpressRuntime<T, U> {
  constructor(private readonly processor: IProcessor<T, U>) {}

  handler: RequestHandler = promisifyHandler(async (req, res) => {
    try {
      const traceId = Guid.check(
        req.header("x-trace-id") ?? GuidExtensions.generate(),
      );

      const r = await this.processor.run({
        header: {
          version: 1,
          traceId,
          created: TimestampExtensions.now(),
        },
        body: req.body,
      });

      return res.status(200).json(r);
    } catch (e) {
      return this.handleError(e, res);
    }
  });

  private handleError = (e: any, res: Response) => {
    if (e instanceof RuntypesValidationError || e instanceof ValidationError) {
      res.status(400);
    }

    if (e instanceof NotFoundError) {
      res.status(404);
    }

    if (e instanceof UnauthorizedError) {
      res.status(401);
    }

    res.status(500);

    return res.end();
  };
}

export class SqsRecordNotFoundError extends NotFoundError {}
