import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwnApiGateway } from "./apigateway";
import { SwnDatabase } from "./database";
import { SwnMicroservices } from "./microservice";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps | undefined) {
    super(scope, id, props);

    // Initialize the database construct
    const database = new SwnDatabase(this, "Database");

    // Initialize the microservices construct with dependencies
    const microservices = new SwnMicroservices(this, "Microservices", {
      productTable: database.productTable, // Pass the product table to microservices
    });

    // Initialize the API Gateway construct with dependencies
    new SwnApiGateway(this, "ApiGateway", {
      productMicroservice: microservices.productMicroservice, // Pass the product microservice to the API Gateway
    });
  }
}
