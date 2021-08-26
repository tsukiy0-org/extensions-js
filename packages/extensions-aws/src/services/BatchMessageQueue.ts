import { Batch } from "aws-sdk";
import {
  Message,
  IMessageQueue,
  GuidExtensions,
} from "@tsukiy0/extensions-core";

type Config = {
  jobName: string;
  jobQueue: string;
  jobDefinition: string;
};

export class BatchMessageQueue<T> implements IMessageQueue<T> {
  constructor(
    private readonly client: Batch,
    private readonly config: Config,
  ) {}

  static build = <T>(config: Config): BatchMessageQueue<T> => {
    return new BatchMessageQueue(new Batch(), config);
  };

  send = async (message: Message<T>): Promise<void> => {
    await this.client
      .submitJob({
        jobName: GuidExtensions.generate(),
        jobQueue: this.config.jobQueue,
        jobDefinition: this.config.jobDefinition,
        parameters: {
          message: JSON.stringify(message),
        },
      })
      .promise();
  };
}
