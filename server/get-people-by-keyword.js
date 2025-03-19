// Import required AWS SDK v3 clients and commands
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // Change the region as needed
const docClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Extract the event ID and keyword from the request
    let eventId, keyword;
    
    // Check if the event ID and keyword are in the path parameters (for API Gateway)
    if (event.pathParameters) {
      eventId = event.pathParameters.id;
      keyword = event.pathParameters.keyword ? event.pathParameters.keyword.toLowerCase() : null;
    }
    
    // Validate that event ID is provided
    if (!eventId) {
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
    
    // Validate that keyword is provided
    if (!keyword) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Keyword is required'
        })
      };
    }
    
    // Define the parameters for the QueryCommand to find all items with the keyword as sort key
    // and the specified event ID
    const queryParams = {
      TableName: process.env.DYNAMODB_TABLE || 'YourTableName',
      IndexName: 'SortIndex', // Assuming a GSI exists on the sort key
      KeyConditionExpression: '#sort = :keyword AND #id = :eventId',
      ExpressionAttributeNames: {
        '#sort': 'sort',
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':keyword': keyword,
        ':eventId': eventId
      }
    };
    
    // Query DynamoDB for all items with the keyword as sort key
    const queryResult = await docClient.send(new QueryCommand(queryParams));
    
    // If no items found, return empty array
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'No people found for the keyword',
          eventId,
        keyword,
          people: []
        })
      };
    }
    
    // For each keyword item, fetch the corresponding person
    const peoplePromises = queryResult.Items.map(async (item) => {
      const personParams = {
        TableName: process.env.DYNAMODB_TABLE || 'YourTableName',
        Key: {
          id: item.id,
          sort: item.person // The 4-digit sort code of the person
        }
      };
      
      try {
        const personResult = await docClient.send(new GetCommand(personParams));
        return personResult.Item;
      } catch (error) {
        console.error(`Error fetching person with id ${item.id} and sort ${item.person}:`, error);
        return null;
      }
    });
    
    // Wait for all person fetches to complete
    const peopleResults = await Promise.all(peoplePromises);
    
    // Filter out any null results (failed fetches)
    const people = peopleResults.filter(person => person !== null);
    
    // Return the list of people
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'People retrieved successfully',
        keyword,
        count: people.length,
        people
      })
    };
  } catch (error) {
    console.error('Error retrieving people by keyword from DynamoDB:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to retrieve people by keyword',
        error: error.message
      })
    };
  }
};
