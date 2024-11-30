import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { CfnOutput } from 'aws-cdk-lib';

export class RepositoryCdkStack extends Stack {
  public readonly imageRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.imageRepository = new ecr.Repository(this, 'image-repository');
  
    new CfnOutput(this, 'EcrRepositoryUrl', { value: this.imageRepository.repositoryUri });  
  }
}
