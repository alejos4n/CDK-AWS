import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroservicesProps {
  productTable: ITable;
  basketTable: ITable;
}

export class SwnMicroservices extends Construct {
  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
    super(scope, id);

    // Product microservice
    this.productMicroservice = this.createProductFunction(props.productTable);

    // Basket microservice
    this.basketMicroservice = this.createBasketFunction(props.basketTable);
  }

  /**
   * Creates the Product Lambda function
   */
  private createProductFunction(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' provided in the Lambda runtime
        ],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X, // Updated to Node.js 22 compatible runtime
    };

    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    });

    productTable.grantReadWriteData(productFunction);

    return productFunction;
  }

  /**
   * Creates the Basket Lambda function
   */
  private createBasketFunction(basketTable: ITable): NodejsFunction {
    const basketFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' provided in the Lambda runtime
        ],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMODB_TABLE_NAME: basketTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X, // Updated to Node.js 22 compatible runtime
    };

    const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
      entry: join(__dirname, `/../src/basket/index.js`),
      ...basketFunctionProps,
    });

    basketTable.grantReadWriteData(basketFunction);

    return basketFunction;
  }
}