import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface SwnEventBusProps {
  publisherFuntion: IFunction;
  targetQueue: IQueue;
}

export class SwnEventBus extends Construct {
  constructor(scope: Construct, id: string, props: SwnEventBusProps) {
    super(scope, id);

    // Create an EventBus
    const bus = new EventBus(this, "SwnEventBus", {
      eventBusName: "SwnEventBus",
    });

    // Define a rule for the CheckoutBasket event
    const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
      eventBus: bus,
      enabled: true,
      description: "Triggered when the Basket microservice checks out a basket",
      eventPattern: {
        source: ["com.swn.basket.checkoutbasket"],
        detailType: ["CheckoutBasket"],
      },
      ruleName: "CheckoutBasketRule",
    });

    // Add the target queue to the rule
    checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));

    // Grant the publisher function permissions to put events to the EventBus
    bus.grantPutEventsTo(props.publisherFuntion);
  }
}