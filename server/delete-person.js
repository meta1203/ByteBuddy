// Import required AWS SDK v3 clients and commands
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // Change the region as needed
const docClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Extract the event ID and person code from the request
    let eventId, personCode;
    
    // Check if the ID and code are in the path parameters (for API Gateway)
    if (event.pathParameters) {
      eventId = event.pathParameters.id;
      personCode = event.pathParameters.code;
    } 
    // Otherwise, check if they're in the body
    else if (event.body) {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      eventId = body.id;
      personCode = body.code;
    }
    // If query parameters are provided
    else if (event.queryStringParameters) {
      eventId = event.queryStringParameters.id;
      personCode = event.queryStringParameters.code;
    }
    
    // Validate that both event ID and person code are provided
    if (!eventId || !personCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Both event ID and person code are required'
        })
      };
    }
    
    // Define the parameters for the DeleteCommand
    const params = {
      TableName: process.env.DYNAMODB_TABLE || 'YourTableName',
      Key: {
        id: eventId,
        sort: personCode
      },
      // Return the values of the deleted item
      ReturnValues: 'ALL_OLD'
    };
    
    // Delete the item from DynamoDB
    const result = await docClient.send(new DeleteCommand(params));
    
    // Check if the item was found and deleted
    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Person not found or already deleted'
        })
      };
    }
    
    console.log('Successfully deleted person from DynamoDB:', result.Attributes);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Person deleted successfully',
        eventId: eventId,
        personCode: personCode
      })
    };
  } catch (error) {
    console.error('Error deleting person from DynamoDB:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to delete person',
        error: error.message
      })
    };
  }
};
