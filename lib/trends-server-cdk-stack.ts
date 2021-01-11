import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';

export class TrendsServerCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new nodejs.NodejsFunction(this, 'GoogleTrendsHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      entry: 'lambdas/googleTrends.js',
      handler: 'handler',
    });

    const api = new apigateway.RestApi(this, 'google-trends-api', {
      restApiName: 'Google Trends API',
      description: 'This service looks up the values from Google Trends',
    });

    const googleTrendsIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    api.root.addMethod('POST', googleTrendsIntegration);
  }
}
