import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
  basketMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);

    // Create API Gateway for Product microservices
    this.createProductApi(props.productMicroservice);

    // Create API Gateway for Basket microservices
    this.createBasketApi(props.basketMicroservice);
  }

  /**
   * Creates API Gateway for Product microservices
   * @param productMicroservice Lambda function for Product microservices
   */
  private createProductApi(productMicroservice: IFunction): void {
    const apigw = new LambdaRestApi(this, "productApi", {
      restApiName: "Product Service",
      handler: productMicroservice,
      proxy: false,
    });

    const product = apigw.root.addResource("product");
    product.addMethod("GET"); // GET /product
    product.addMethod("POST"); // POST /product

    const singleProduct = product.addResource("{id}"); // product/{id}
    singleProduct.addMethod("GET"); // GET /product/{id}
    singleProduct.addMethod("PUT"); // PUT /product/{id}
    singleProduct.addMethod("DELETE"); // DELETE /product/{id}
  }

  /**
   * Creates API Gateway for Basket microservices
   * @param basketMicroservice Lambda function for Basket microservices
   */
  private createBasketApi(basketMicroservice: IFunction): void {
    const apigw = new LambdaRestApi(this, "basketApi", {
      restApiName: "Basket Service",
      handler: basketMicroservice,
      proxy: false,
    });

    const basket = apigw.root.addResource("basket");
    basket.addMethod("GET"); // GET /basket
    basket.addMethod("POST"); // POST /basket

    const singleBasket = basket.addResource("{userName}"); // basket/{userName}
    singleBasket.addMethod("GET"); // GET /basket/{userName}
    singleBasket.addMethod("DELETE"); // DELETE /basket/{userName}

    const basketCheckout = basket.addResource("checkout"); // basket/checkout
    basketCheckout.addMethod("POST"); // POST /basket/checkout
    // expected request payload: { userName: "swn" }
  }
}

