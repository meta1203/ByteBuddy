// Import required AWS SDK v3 clients and commands
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // Change the region as needed
const docClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the incoming event body if it's a string
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    
    // Extract the event ID from the request
    let eventId;
    
    // Check if the ID is in the path parameters (for API Gateway)
    if (event.pathParameters && event.pathParameters.id) {
      eventId = event.pathParameters.id;
    } 
    // Otherwise, check if it's in the body
    else if (body.id) {
      eventId = body.id;
    } 
    // If no ID is provided, return an error
    else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Event ID is required'
        })
      };
    }
    
    // Define the parameters for the GetCommand
    // Since the sort key is always "event", we can hardcode it
    const params = {
      TableName: process.env.DYNAMODB_TABLE || 'YourTableName',
      Key: {
        id: eventId,
        sort: 'event'
      }
    };
    
    // Get the item from DynamoDB
    const result = await docClient.send(new GetCommand(params));
    
    // Check if the item was found
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Event not found'
        })
      };
    }
    
    console.log('Successfully retrieved event from DynamoDB:', result.Item);
    
    // Return the event data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Event retrieved successfully',
        event: result.Item
      })
    };
  } catch (error) {
    console.error('Error reading event from DynamoDB:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to retrieve event',
        error: error.message
      })
    };
  }
};
