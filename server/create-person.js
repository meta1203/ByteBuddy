// Import required AWS SDK v3 clients and commands
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' }); // Change the region as needed
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Generate a random 4-digit code padded with leading zeros if needed
 * @returns {string} 4-digit code (e.g., "0123", "9999")
 */
function generateSortCode() {
  // Generate a random number between 0 and 9999
  const randomNum = Math.floor(Math.random() * 10000);
  // Pad with leading zeros to ensure it's 4 digits
  return randomNum.toString().padStart(4, '0');
}

/**
 * Extract keywords (5+ character words) from text
 * @param {string} text - The text to extract keywords from
 * @returns {string[]} Array of unique keywords
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words and filter for words with 5+ characters
  const words = cleanText.split(/\s+/).filter(word => word.length >= 5);
  
  // Remove duplicates
  return [...new Set(words)];
}

// Lambda function handler
exports.handler = async (event, context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the incoming event body if it's a string
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    
    // Extract the event ID from the path parameters
    const eventId = event.pathParameters && event.pathParameters.id;
    
    // Validate that event ID is provided in the path
    if (!eventId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Event ID is required in the path'
        })
      };
    }
    
    if (!body.name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Person name is required'
        })
      };
    }
    
    // Generate a random 4-digit sort code
    const sort = generateSortCode();
    
    // Create a timestamp for the record
    const timestamp = new Date().toISOString();
    
    // Prepare the item to be saved to DynamoDB
    const item = {
      id: eventId, // Use the event ID from the path parameter
      sort,
      name: body.name,
      timestamp,
      ...(body.description && { description: body.description }),
      ...(body.photo && { photo: body.photo }) // Store photo as binary if provided
    };
    
    // Define the parameters for the PutCommand
    const params = {
      TableName: process.env.DYNAMODB_TABLE || 'YourTableName', // Table name from environment variable or default
      Item: item
    };
    
    // Write the person item to DynamoDB
    const result = await docClient.send(new PutCommand(params));
    
    console.log('Successfully wrote person to DynamoDB:', result);
    
    // Extract keywords from name and description
    const nameKeywords = extractKeywords(body.name);
    const descriptionKeywords = body.description ? extractKeywords(body.description) : [];
    
    // Combine keywords and remove duplicates
    const allKeywords = [...new Set([...nameKeywords, ...descriptionKeywords])];
    
    console.log('Extracted keywords:', allKeywords);
    
    if (allKeywords.length > 0) {
      // Create keyword items for batch write
      const keywordItems = allKeywords.map(keyword => ({
        PutRequest: {
          Item: {
            id: eventId, // Use the event ID from the path parameter
            sort: keyword,
            person: sort // The 4-digit number of the person
          }
        }
      }));
      
      // DynamoDB BatchWrite has a limit of 25 items per request
      // Split into chunks if needed
      const chunkSize = 25;
      for (let i = 0; i < keywordItems.length; i += chunkSize) {
        const chunk = keywordItems.slice(i, i + chunkSize);
        
        // Define the parameters for the BatchWriteCommand
        const batchParams = {
          RequestItems: {
            [process.env.DYNAMODB_TABLE || 'YourTableName']: chunk
          }
        };
        
        // Write the keyword items to DynamoDB
        const batchResult = await docClient.send(new BatchWriteCommand(batchParams));
        console.log('Successfully wrote keyword items to DynamoDB:', batchResult);
      }
    }
    
    // Return a success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Person created successfully',
        personId: eventId,
        sortCode: sort,
        keywords: allKeywords
      })
    };
  } catch (error) {
    console.error('Error writing person to DynamoDB:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to create person',
        error: error.message
      })
    };
  }
};
