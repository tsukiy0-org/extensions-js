import "source-map-support/register";
import { SqsLambdaRuntime } from "@tsukiy0/extensions-aws";
import { Processor } from "./Processor";

export const handler = new SqsLambdaRuntime(
  "TestSqsLambdaRuntime",
  new Processor(),
).handler;
