/**
 * This script demonstrates how to test the Lambda functions locally
 * by simulating AWS Lambda events for both creating and reading events.
 */

// Import the Lambda handlers
const { handler: createHandler } = require('./create-event');
const { handler: readHandler } = require('./get-event');

// Set environment variables for local testing
process.env.DYNAMODB_TABLE = 'YourTableName'; // Replace with your actual table name

// Create a mock event for creating an event
const createMockEvent = {
  body: {
    // Sample data to write to DynamoDB
    name: 'Test Event',
    description: 'This is a test event created locally',
    metadata: {
      createdBy: 'local-test',
      environment: 'development'
    }
  }
};

// Function to run the tests
async function runTests() {
  console.log('=== TESTING CREATE EVENT FUNCTION ===');
  console.log('Create event request:');
  console.log(JSON.stringify(createMockEvent, null, 2));
  
  try {
    // Step 1: Create an event
    console.log('\nInvoking create event handler...');
    const createResult = await createHandler(createMockEvent);
    
    console.log('\nCreate event response:');
    console.log(JSON.stringify(createResult, null, 2));
    
    // Parse the response body
    let eventId;
    if (typeof createResult.body === 'string') {
      const parsedBody = JSON.parse(createResult.body);
      console.log('\nParsed create response:');
      console.log(JSON.stringify(parsedBody, null, 2));
      
      // Extract the event ID for the read test
      eventId = parsedBody.eventId;
    }
    
    if (eventId) {
      // Step 2: Get the event we just created
      console.log('\n\n=== TESTING GET EVENT FUNCTION ===');
      
      // Create a mock event for getting an event
      const readMockEvent = {
        pathParameters: {
          id: eventId
        }
      };
      
      console.log('Get event request:');
      console.log(JSON.stringify(readMockEvent, null, 2));
      
      console.log('\nInvoking get event handler...');
      const readResult = await readHandler(readMockEvent);
      
      console.log('\nGet event response:');
      console.log(JSON.stringify(readResult, null, 2));
      
      // Parse the response body
      if (typeof readResult.body === 'string') {
        const parsedBody = JSON.parse(readResult.body);
        console.log('\nParsed get response:');
        console.log(JSON.stringify(parsedBody, null, 2));
      }
    }
    
    console.log('\nNote: For these tests to actually work with DynamoDB, you need:');
    console.log('1. Valid AWS credentials configured in your environment');
    console.log('2. Appropriate permissions to read/write to the DynamoDB table');
    console.log('3. The table must exist in your AWS account with the correct schema');
  } catch (error) {
    console.error('\nError testing Lambda functions:');
    console.error(error);
  }
}

// Run the tests
runTests();
