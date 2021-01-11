#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TrendsServerCdkStack } from '../lib/trends-server-cdk-stack';

const app = new cdk.App();
new TrendsServerCdkStack(app, 'TrendsServerCdkStack');
