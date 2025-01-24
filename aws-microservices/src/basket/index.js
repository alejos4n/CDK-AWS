import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";

export const handler = async (event) => {
  console.log("Request received:", JSON.stringify(event, null, 2));

  let body;

  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.pathParameters?.userName) {
          body = await getBasket(event.pathParameters.userName); // GET /basket/{userName}
        } else {
          body = await getAllBaskets(); // GET /basket
        }
        break;
      case "POST":
        if (event.path === "/basket/checkout") {
          body = await checkoutBasket(event); // POST /basket/checkout
        } else {
          body = await createBasket(event); // POST /basket
        }
        break;
      case "DELETE":
        body = await deleteBasket(event.pathParameters?.userName); // DELETE /basket/{userName}
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    console.log("Operation result:", body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully performed operation: "${event.httpMethod}"`,
        body,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
  }
};

// Retrieve a basket by userName
const getBasket = async (userName) => {
  console.log(`Fetching basket for userName: ${userName}`);
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ userName }),
    };

    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.error("Error fetching basket:", error);
    throw error;
  }
};

// Retrieve all baskets
const getAllBaskets = async () => {
  console.log("Fetching all baskets");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    return Items ? Items.map((item) => unmarshall(item)) : [];
  } catch (error) {
    console.error("Error fetching baskets:", error);
    throw error;
  }
};

// Create a new basket
const createBasket = async (event) => {
  console.log("Creating basket");
  try {
    const requestBody = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(requestBody || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    return createResult;
  } catch (error) {
    console.error("Error creating basket:", error);
    throw error;
  }
};

// Delete a basket by userName
const deleteBasket = async (userName) => {
  console.log(`Deleting basket for userName: ${userName}`);
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ userName }),
    };

    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
    return deleteResult;
  } catch (error) {
    console.error("Error deleting basket:", error);
    throw error;
  }
};

// Checkout basket (to be implemented)
const checkoutBasket = async (event) => {
  console.log("Checking out basket (not yet implemented)");
  // Placeholder for checkout logic
};