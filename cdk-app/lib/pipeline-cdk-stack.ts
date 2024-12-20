import { CfnOutput, CfnParameter, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';

interface ConsumerProps extends StackProps {
  ecrRepository: ecr.Repository;
}

export class PipelineCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: ConsumerProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'CICD_Pipeline', {
      crossAccountKeys: false,
    });

    const codeQualityBuild = new codebuild.PipelineProject(
      this,
      'Code Quality',
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          privileged: true,
          computeType: codebuild.ComputeType.LARGE
        },
        buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec_test.yml')
      }
    );

    const dockerBuildProject = new codebuild.PipelineProject(this, 'DockerBuildProject', {
      environmentVariables: {
        'IMAGE_TAG': { value: 'latest' },
        'IMAGE_REPO_URI': {value: props.ecrRepository.repositoryUri },
        'AWS_DEFAULT_REGION': {value: process.env.CDK_DEFAULT_REGION },
      },
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true,
        computeType: codebuild.ComputeType.LARGE
        },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec_docker.yml'),
    });

    const dockerBuildRolePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:GetRepositoryPolicy',
        'ecr:DescribeRepositories',
        'ecr:ListImages',
        'ecr:DescribeImages',
        'ecr:BatchGetImage',
        'ecr:InitiateLayerUpload',
        'ecr:UploadLayerPart',
        'ecr:CompleteLayerUpload',
        'ecr:PutImage',
      ],
    });

    dockerBuildProject.addToRolePolicy(dockerBuildRolePolicy);

    const sourceOutput = new codepipeline.Artifact();
    const unitTestOutput = new codepipeline.Artifact();
    const dockerBuildOutput = new codepipeline.Artifact();

    const gitToken = new CfnParameter(this, 'gittoken', {
      type: 'String',
      noEcho: true
    });
    
    new secrets.Secret(this, 'github-token', {
      secretName: 'github-token',
      secretObjectValue: {
        token: SecretValue.unsafePlainText(gitToken.valueAsString),
      },
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'Source',
          owner: 'enrique-esquivel',
          repo: 'todo-list-app',
          oauthToken: SecretValue.secretsManager('github-token', { jsonField : 'token' }), 
          output: sourceOutput,
          branch: 'main',
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Code-Quality-Testing',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Unit-Test',
          project: codeQualityBuild,
          input: sourceOutput,
          outputs: [unitTestOutput],
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Docker-Push-ECR',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'docker-build',
          project: dockerBuildProject,
          input: sourceOutput,
          outputs: [dockerBuildOutput],
        }),
      ],
    });

  }
}
