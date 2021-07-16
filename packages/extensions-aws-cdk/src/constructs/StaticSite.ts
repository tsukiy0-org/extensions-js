import {
  BehaviorOptions,
  CachePolicy,
  Distribution,
  ICachePolicy,
  OriginProtocolPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/lib/aws-cloudfront-origins";
import { RecordTarget } from "aws-cdk-lib/lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/lib/aws-route53-targets";
import { Bucket, IBucket } from "aws-cdk-lib/lib/aws-s3";
import { BucketDeployment, ISource } from "aws-cdk-lib/lib/aws-s3-deployment";
import { Construct } from "constructs";
import { DomainName } from "./DomainName";

export class StaticSite extends Construct {
  public readonly bucket: IBucket;

  public constructor(
    scope: Construct,
    id: string,
    props: {
      source: ISource;
      behaviors: { path: string; cachePolicy: ICachePolicy }[];
      domainName?: DomainName;
    },
  ) {
    super(scope, id);

    const bucket = new Bucket(this, "Bucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      publicReadAccess: true,
    });

    new BucketDeployment(this, "BucketDeployment", {
      destinationBucket: bucket,
      sources: [props.source],
    });

    const origin = new HttpOrigin(bucket.bucketWebsiteDomainName, {
      protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
    });

    const behaviors = props.behaviors.reduce<Record<string, BehaviorOptions>>(
      (acc, next) => {
        return {
          ...acc,
          [next.path]: {
            origin,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: next.cachePolicy,
          },
        };
      },
      {},
    );

    const cdn = new Distribution(this, "CloudFront", {
      certificate: props.domainName?.certificate,
      domainNames: props.domainName ? [props.domainName.domainName] : undefined,
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: behaviors,
    });

    props.domainName?.addARecord(
      RecordTarget.fromAlias(new CloudFrontTarget(cdn)),
    );

    this.bucket = bucket;
  }
}