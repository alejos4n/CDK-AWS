import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ddbClient } from "./ddbClient.js";

export const handler = async function (event) {
  console.log("Request:", JSON.stringify(event, undefined, 2));

  try {
    let body;

    switch (event.httpMethod) {
      case "GET":
        if (event.queryStringParameters != null) {
          body = await getProductsByCategory(event); // GET product/1234?category=Phone
        } else if (event.pathParameters != null) {
          body = await getProduct(event.pathParameters.id); // GET product/{id}
        } else {
          body = await getAllProducts(); // GET product
        }
        break;
      case "POST":
        body = await createProduct(event); // POST /product
        break;
      case "DELETE":
        body = await deleteProduct(event.pathParameters.id); // DELETE /product/{id}
        break;
      case "PUT":
        body = await updateProduct(event); // PUT /product/{id}
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    console.log("Response Body:", body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully finished operation: "${event.httpMethod}"`,
        body,
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const getProduct = async (productId) => {
  console.log("getProduct");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const { Item } = await ddbClient.send(new GetItemCommand(params));
    console.log("DynamoDB Response:", Item);
    return Item ? unmarshall(Item) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllProducts = async () => {
  console.log("getAllProducts");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log("DynamoDB Response:", Items);
    return Items ? Items.map((item) => unmarshall(item)) : [];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createProduct = async (event) => {
  console.log("createProduct");
  try {
    const productRequest = JSON.parse(event.body);
    const productId = uuidv4(); // Generate unique ID
    productRequest.id = productId;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log("DynamoDB Response:", createResult);
    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteProduct = async (productId) => {
  console.log("deleteProduct");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
    console.log("DynamoDB Response:", deleteResult);
    return deleteResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateProduct = async (event) => {
  console.log("updateProduct");
  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: requestBody[key],
          }),
          {}
        )
      ),
    };

    const updateResult = await ddbClient.send(new UpdateItemCommand(params));
    console.log("DynamoDB Response:", updateResult);
    return updateResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getProductsByCategory = async (event) => {
  console.log("getProductsByCategory");
  try {
    const productId = event.pathParameters.id;
    const category = event.queryStringParameters.category;

    const params = {
      KeyConditionExpression: "id = :productId",
      FilterExpression: "contains (category, :category)",
      ExpressionAttributeValues: marshall({
        ":productId": productId,
        ":category": category,
      }),
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log("DynamoDB Response:", Items);
    return Items.map((item) => unmarshall(item));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
