export const handler = async (event) => {
    console.log("Request:", JSON.stringify(event, null, 2));
  
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello from Basket! You've hit ${event.path}\n`,
    };
  };
  