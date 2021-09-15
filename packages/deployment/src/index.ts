import { AppStack } from "./stacks/AppStack";
import { ExternalStack } from "./stacks/ExternalStack";
import { SystemConfiguration } from "@tsukiy0/extensions-core";
import { App } from "aws-cdk-lib";

const app = new App();

const configuration = new SystemConfiguration();
const testTableName = "test-table-name";

new ExternalStack(app, "External", {
  env: {
    account: configuration.get("CDK_DEFAULT_ACCOUNT"),
    region: "us-east-1",
  },
  testTableName,
});

new AppStack(app, "AppUsEast1", {
  env: {
    account: configuration.get("CDK_DEFAULT_ACCOUNT"),
    region: "us-east-1",
  },
  testTableName,
});
