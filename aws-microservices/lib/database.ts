import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class SwnDatabase extends Construct {
  public readonly productTable: ITable;
  public readonly basketTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Product table
    this.productTable = this.createProductTable();

    // Basket table
    this.basketTable = this.createBasketTable();
  }

  /**
   * Creates the Product DynamoDB Table
   * product : PK: id -- name - description - imageFile - price - category
   */
  private createProductTable(): ITable {
    return new Table(this, "product", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      tableName: "product",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  /**
   * Creates the Basket DynamoDB Table
   * basket : PK: userName -- items (SET-MAP object)
   * item1 - { quantity - color - price - productId - productName }
   * item2 - { quantity - color - price - productId - productName }
   */
  private createBasketTable(): ITable {
    return new Table(this, "basket", {
      partitionKey: { name: "userName", type: AttributeType.STRING },
      tableName: "basket",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
