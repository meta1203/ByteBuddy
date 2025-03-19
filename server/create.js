// Import required AWS SDK v3 clients and commands
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // Change the region as needed
const docClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the incoming event body if it's a string
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    
    // Validate that name is provided
    if (!body.name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Event name is required'
        })
      };
    }
    
    // Generate a random UUID for the id
    const id = randomUUID();
    
    // Set the sort key to always be "event"
    const sort = 'event';
    
    // Create a timestamp for the record
    const timestamp = new Date().toISOString();
    
    // Prepare the item to be saved to DynamoDB
    const item = {
      id,
      sort,
      name: body.name,
      timestamp,
      // Include any additional fields from the request body
      ...(body.description && { description: body.description }),
      ...(body.metadata && { metadata: body.metadata })
    };
    
    // Define the parameters for the PutCommand
    const params = {
      TableName: process.env.DYNAMODB_TABLE || 'YourTableName', // Table name from environment variable or default
      Item: item
    };
    
    // Write the item to DynamoDB
    const result = await docClient.send(new PutCommand(params));
    
    console.log('Successfully wrote event to DynamoDB:', result);
    
    // Return a success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Event created successfully',
        eventId: id
      })
    };
  } catch (error) {
    console.error('Error writing event to DynamoDB:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to create event',
        error: error.message
      })
    };
  }
};
