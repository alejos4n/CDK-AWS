import { aws_s3, aws_s3_notifications, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, BucketProps } from 'aws-cdk-lib/aws-s3';
import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class HolacdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Definición de propiedades para la cola (SQS)
    const queueProps: QueueProps = {
      visibilityTimeout: Duration.seconds(300), // Timeout de visibilidad de 5 minutos
    };

    // Creación de la cola
    const queue = new Queue(this, 'HelloCdkQueue', queueProps);

    // Definición de propiedades para el bucket (S3)
    const bucketProps: BucketProps = {
      versioned: true, // Habilitar versionado
      removalPolicy: RemovalPolicy.DESTROY, // Eliminar el bucket al destruir la pila
      autoDeleteObjects: true, // Borrar los objetos automáticamente al destruir el bucket
    };

    // Creación del bucket
    const newBucket = new Bucket(this, 'MyFirstBucke', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // Ejemplo de posible integración entre S3 y SQS (opcional)
    // Puedes añadir una notificación para enviar mensajes a SQS cuando ocurran eventos en el bucket
    newBucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.SqsDestination(queue)
    );
  }
}
