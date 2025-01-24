import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SwnApiGateway } from './apigateway';
import { SwnDatabase } from './database';
import { SwnEventBus } from './eventbus';
import { SwnMicroservices } from './microservice';
import { SwnQueue } from './queue';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create Database resources
    const database = new SwnDatabase(this, 'Database');

    // Create Microservices and pass database tables as props
    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    });

    // Create API Gateway and link it to microservices
    new SwnApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice,
      orderingMicroservices: microservices.orderingMicroservice
    });

    // Create Queue and link it to the ordering microservice as a consumer
    const queue = new SwnQueue(this, 'Queue', {
      consumer: microservices.orderingMicroservice
    });

    // Create EventBus and set the publisher and target queue
    new SwnEventBus(this, 'EventBus', {
      publisherFuntion: microservices.basketMicroservice,
      targetQueue: queue.orderQueue
    });
  }
}
