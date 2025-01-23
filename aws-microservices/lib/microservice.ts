import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroservicesProps {
  productTable: ITable;
}

export class SwnMicroservices extends Construct {
  public readonly productMicroservice: NodejsFunction;

  constructor(scope, id, props: SwnMicroservicesProps) {
    super(scope, id);

    // Lambda function configuration
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          // Exclude AWS SDK, as it's pre-installed in Lambda runtime
          "aws-sdk",
        ],
      },
      environment: {
        PRIMARY_KEY: "id", // Environment variable for the primary key
        DYNAMODB_TABLE_NAME: props.productTable.tableName, // Pass table name as environment variable
      },
      runtime: Runtime.NODEJS_22_X, // Updated to Node.js 22 runtime
    };

    // Define the Lambda function for the product microservice
    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, `/../src/product/index.js`), // Entry point for the Lambda function
      ...nodeJsFunctionProps,
    });

    // Grant the Lambda function permissions to read and write to the DynamoDB table
    props.productTable.grantReadWriteData(productFunction);

    // Expose the Lambda function as a public property
    this.productMicroservice = productFunction;
  }
}
