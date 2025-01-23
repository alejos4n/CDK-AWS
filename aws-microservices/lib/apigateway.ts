import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);

    // API Gateway for Product Microservice
    const apigw = new LambdaRestApi(this, "ProductApi", {
      restApiName: "Product Service", // API Name
      handler: props.productMicroservice, // Main Lambda handler
      proxy: false, // Disable automatic proxy to allow custom routes
    });

    // Define the /product root resource
    const product = apigw.root.addResource("product");
    product.addMethod("GET"); // GET /product
    product.addMethod("POST"); // POST /product

    // Define a sub-resource for /product/{id}
    const singleProduct = product.addResource("{id}");
    singleProduct.addMethod("GET"); // GET /product/{id}
    singleProduct.addMethod("PUT"); // PUT /product/{id}
    singleProduct.addMethod("DELETE"); // DELETE /product/{id}
  }
}
