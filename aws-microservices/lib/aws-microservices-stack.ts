import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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

    // Configuración de propiedades comunes para las funciones Lambda
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'], // Excluir aws-sdk del empaquetado (AWS Lambda ya lo incluye)
      },
      environment: {
        PRIMARY_KEY: 'id', // Variable de entorno para la clave primaria
        DYNAMODB_TABLE_NAME: productTable.tableName, // Nombre de la tabla como variable de entorno
      },
      runtime: Runtime.NODEJS_18_X, // Actualizado al runtime más reciente soportado
    };

    // Función Lambda para el microservicio de productos
    const productFunction = new NodejsFunction(this, 'ProductLambdaFunction', {
      entry: join(__dirname, '../src/product/index.js'), // Archivo de entrada de la función
      ...nodeJsFunctionProps,
    });

    // Otorgar permisos de lectura y escritura en la tabla a la función Lambda
    productTable.grantReadWriteData(productFunction);

    // Configuración de API Gateway para el microservicio de productos
    const apigw = new LambdaRestApi(this, 'ProductApi', {
      restApiName: 'Product Service', // Nombre de la API
      handler: productFunction, // Función Lambda principal
      proxy: false, // Configuración personalizada de rutas
    });

    // Recurso raíz: /product
    const product = apigw.root.addResource('product');
    product.addMethod('GET'); // GET /product
    product.addMethod('POST'); // POST /product

    // Recurso para manejar un producto específico: /product/{id}
    const singleProduct = product.addResource('{id}');
    singleProduct.addMethod('GET'); // GET /product/{id}
    singleProduct.addMethod('PUT'); // PUT /product/{id}
    singleProduct.addMethod('DELETE'); // DELETE /product/{id}
  }
}
