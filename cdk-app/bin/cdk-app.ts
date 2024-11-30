#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RepositoryCdkStack } from '../lib/repository-cdk-stack';
import { PipelineCdkStack } from '../lib/pipeline-cdk-stack';

const app = new cdk.App();
const basename = 'todo';
const repoCdkStack = new RepositoryCdkStack(app, `${basename}-repo`, {});

const pipelineCdkStack = new PipelineCdkStack(app, `${basename}-pipeline`, {
  ecrRepository: repoCdkStack.imageRepository,
});
