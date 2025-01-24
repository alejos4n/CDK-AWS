import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class SwnDatabase extends Construct {
  /**
   * Expose the product table as a public property.
   */
  productTable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Definición de la tabla DynamoDB
    const productTable = new Table(this, 'ProductTable', {
        partitionKey: {
          name: 'id',
          type: AttributeType.STRING, // La clave primaria es de tipo STRING
        },
        tableName: 'product', // Nombre de la tabla
        removalPolicy: RemovalPolicy.DESTROY, // Se elimina la tabla al destruir la pila
        billingMode: BillingMode.PAY_PER_REQUEST, // Modo de facturación: pago por solicitud
      });

    this.productTable = productTable;
  }
}
