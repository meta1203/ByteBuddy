/**
 * This script demonstrates how to test the Person Lambda functions locally
 * by simulating AWS Lambda events for creating, retrieving, and deleting person objects.
 */

// Import the Lambda handlers
const { handler: createPersonHandler } = require('./create-person');
const { handler: getPersonHandler } = require('./get-person');
const { handler: deletePersonHandler } = require('./delete-person');
const { handler: getPeopleByKeywordHandler } = require('./get-people-by-keyword');
const { randomUUID } = require('crypto');

// Set environment variables for local testing
process.env.DYNAMODB_TABLE = 'YourTableName'; // Replace with your actual table name

// Create a mock event ID (simulating an existing event)
const eventId = randomUUID();

// Create mock events for creating persons with keywords
const createPerson1MockEvent = {
  pathParameters: {
    id: eventId
  },
  body: {
    // Sample data with keywords (words with 5+ characters)
    name: 'John Smith Developer',
    description: 'Senior Software Engineer with extensive experience in JavaScript and Node.js',
    photo: Buffer.from('This would be a binary photo in production').toString('base64')
  }
};

const createPerson2MockEvent = {
  pathParameters: {
    id: eventId
  },
  body: {
    // Sample data with some overlapping keywords
    name: 'Jane Developer',
    description: 'Frontend Engineer with expertise in React and JavaScript frameworks',
    photo: Buffer.from('This would be a binary photo in production').toString('base64')
  }
};

// Function to run the tests
async function runTests() {
  try {
    // Step 1: Create first person
    console.log('=== TESTING CREATE PERSON 1 FUNCTION ===');
    console.log('Create person 1 request:');
    console.log(JSON.stringify(createPerson1MockEvent, null, 2));
    
    console.log('\nInvoking create person handler for person 1...');
    const createResult1 = await createPersonHandler(createPerson1MockEvent);
    
    console.log('\nCreate person 1 response:');
    console.log(JSON.stringify(createResult1, null, 2));
    
    // Parse the response body
    let sortCode1, keywords1;
    if (typeof createResult1.body === 'string') {
      const parsedBody = JSON.parse(createResult1.body);
      console.log('\nParsed create person 1 response:');
      console.log(JSON.stringify(parsedBody, null, 2));
      
      // Extract the sort code and keywords
      sortCode1 = parsedBody.sortCode;
      keywords1 = parsedBody.keywords || [];
    }
    
    // Step 2: Create second person
    console.log('\n\n=== TESTING CREATE PERSON 2 FUNCTION ===');
    console.log('Create person 2 request:');
    console.log(JSON.stringify(createPerson2MockEvent, null, 2));
    
    console.log('\nInvoking create person handler for person 2...');
    const createResult2 = await createPersonHandler(createPerson2MockEvent);
    
    console.log('\nCreate person 2 response:');
    console.log(JSON.stringify(createResult2, null, 2));
    
    // Parse the response body
    let sortCode2, keywords2;
    if (typeof createResult2.body === 'string') {
      const parsedBody = JSON.parse(createResult2.body);
      console.log('\nParsed create person 2 response:');
      console.log(JSON.stringify(parsedBody, null, 2));
      
      // Extract the sort code and keywords
      sortCode2 = parsedBody.sortCode;
      keywords2 = parsedBody.keywords || [];
    }
    
    // Step 3: Get the first person
    if (sortCode1) {
      console.log('\n\n=== TESTING GET PERSON 1 FUNCTION ===');
      
      // Create a mock event for getting a person
      const getPersonMockEvent = {
        pathParameters: {
          id: eventId,
          code: sortCode1
        }
      };
      
      console.log('Get person 1 request:');
      console.log(JSON.stringify(getPersonMockEvent, null, 2));
      
      console.log('\nInvoking get person handler...');
      const getResult = await getPersonHandler(getPersonMockEvent);
      
      console.log('\nGet person 1 response:');
      console.log(JSON.stringify(getResult, null, 2));
      
      // Parse the response body
      if (typeof getResult.body === 'string') {
        const parsedBody = JSON.parse(getResult.body);
        console.log('\nParsed get person 1 response:');
        console.log(JSON.stringify(parsedBody, null, 2));
      }
    }
    
    // Step 4: Test get people by keyword
    // Find a common keyword between both persons if possible
    const commonKeywords = keywords1 && keywords2 ? 
      keywords1.filter(kw => keywords2.includes(kw)) : [];
    
    const testKeyword = commonKeywords.length > 0 ? 
      commonKeywords[0] : (keywords1 && keywords1.length > 0 ? keywords1[0] : 'javascript');
    
    console.log('\n\n=== TESTING GET PEOPLE BY KEYWORD FUNCTION ===');
    
    // Create a mock event for getting people by keyword
    const getPeopleByKeywordMockEvent = {
      pathParameters: {
        id: eventId,
        keyword: testKeyword
      }
    };
    
    console.log(`Get people by keyword request (keyword: ${testKeyword}):`);
    console.log(JSON.stringify(getPeopleByKeywordMockEvent, null, 2));
    
    console.log('\nInvoking get people by keyword handler...');
    const getPeopleByKeywordResult = await getPeopleByKeywordHandler(getPeopleByKeywordMockEvent);
    
    console.log('\nGet people by keyword response:');
    console.log(JSON.stringify(getPeopleByKeywordResult, null, 2));
    
    // Parse the response body
    if (typeof getPeopleByKeywordResult.body === 'string') {
      const parsedBody = JSON.parse(getPeopleByKeywordResult.body);
      console.log('\nParsed get people by keyword response:');
      console.log(JSON.stringify(parsedBody, null, 2));
    }
    
    // Step 5: Delete both persons
    if (sortCode1) {
      console.log('\n\n=== TESTING DELETE PERSON 1 FUNCTION ===');
      
      // Create a mock event for deleting a person
      const deletePersonMockEvent = {
        pathParameters: {
          id: eventId,
          code: sortCode1
        }
      };
      
      console.log('Delete person 1 request:');
      console.log(JSON.stringify(deletePersonMockEvent, null, 2));
      
      console.log('\nInvoking delete person handler...');
      const deleteResult = await deletePersonHandler(deletePersonMockEvent);
      
      console.log('\nDelete person 1 response:');
      console.log(JSON.stringify(deleteResult, null, 2));
      
      // Parse the response body
      if (typeof deleteResult.body === 'string') {
        const parsedBody = JSON.parse(deleteResult.body);
        console.log('\nParsed delete person 1 response:');
        console.log(JSON.stringify(parsedBody, null, 2));
      }
    }
    
    if (sortCode2) {
      console.log('\n\n=== TESTING DELETE PERSON 2 FUNCTION ===');
      
      // Create a mock event for deleting a person
      const deletePersonMockEvent = {
        pathParameters: {
          id: eventId,
          code: sortCode2
        }
      };
      
      console.log('Delete person 2 request:');
      console.log(JSON.stringify(deletePersonMockEvent, null, 2));
      
      console.log('\nInvoking delete person handler...');
      const deleteResult = await deletePersonHandler(deletePersonMockEvent);
      
      console.log('\nDelete person 2 response:');
      console.log(JSON.stringify(deleteResult, null, 2));
      
      // Parse the response body
      if (typeof deleteResult.body === 'string') {
        const parsedBody = JSON.parse(deleteResult.body);
        console.log('\nParsed delete person 2 response:');
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
