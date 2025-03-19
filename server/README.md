# AWS Lambda Event Functions

This project contains AWS Lambda functions written in JavaScript using AWS SDK v3 that create and read event objects in a DynamoDB table.

## Project Structure

- `create.js` - Lambda function that creates event objects in DynamoDB
- `read.js` - Lambda function that reads event objects from DynamoDB
- `package.json` - Node.js dependencies and project configuration
- `test-local.js` - Script to test both Lambda functions locally
- `deploy.sh` - Bash script to deploy the Lambda functions to AWS
- `template.yaml` - AWS SAM template for deploying the functions with API Gateway and DynamoDB table
- `.gitignore` - Git ignore file for Node.js projects

## Setup

### Prerequisites

- AWS Account
- Node.js 14.x or later
- AWS CLI configured with appropriate permissions
- (Optional) AWS SAM CLI for SAM deployment

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd server
   npm install
   ```

### Configuration

Set the following environment variables in your Lambda function configuration:

- `DYNAMODB_TABLE`: The name of your DynamoDB table (default: "YourTableName")
- `AWS_REGION`: The AWS region where your DynamoDB table is located (default: "us-east-1")

### Deployment Options

#### Option 1: Using the Deployment Script

The included `deploy.sh` script automates the deployment process:

1. Make the script executable (if not already):
   ```
   chmod +x deploy.sh
   ```

2. Edit the script to set your AWS region and IAM role ARN
   
3. Run the script:
   ```
   ./deploy.sh
   ```

#### Option 2: Manual Deployment

1. Create a ZIP file containing the Lambda function and its dependencies:
   ```
   zip -r function.zip create.js node_modules
   ```

2. Create the Lambda function using AWS CLI:
   ```
   aws lambda create-function \
     --function-name dynamodb-writer \
     --runtime nodejs16.x \
     --handler create.handler \
     --zip-file fileb://function.zip \
     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-dynamodb-role
   ```

   Note: Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID and ensure the IAM role has appropriate permissions.

#### Option 3: Using AWS SAM

Deploy the Lambda functions and DynamoDB table using SAM:
```
sam build
sam deploy --guided
```

### Required IAM Permissions

The Lambda function needs the following permissions:
- `dynamodb:PutItem` on the target DynamoDB table

You can create an IAM policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "dynamodb:PutItem",
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME"
    }
  ]
}
```

Replace `REGION`, `ACCOUNT_ID`, and `TABLE_NAME` with your specific values.

## Usage

### Create Event Function

#### Input Format

The create event function expects an event object with the following structure:

```json
{
  "body": {
    "name": "Event Name",  // Required
    "description": "Event description",  // Optional
    "metadata": {  // Optional
      "field1": "value1",
      "field2": "value2"
    }
  }
}
```

The function will:
- Generate a random UUID for the `id`
- Set the `sort` key to "event"
- Include the provided `name` and any other fields

#### Output Format

The function returns a response with the following structure:

##### Success (HTTP 200)
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Event created successfully",
    "eventId": "generated-uuid"
  }
}
```

##### Error (HTTP 400 - Missing Name)
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Event name is required"
  }
}
```

##### Error (HTTP 500 - Server Error)
```json
{
  "statusCode": 500,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Failed to create event",
    "error": "Error message"
  }
}
```

### Read Event Function

#### Input Format

The read event function can be called in two ways:

1. Via API Gateway with path parameters:
   ```
   GET /events/{id}
   ```

2. Via direct Lambda invocation:
   ```json
   {
     "body": {
       "id": "event-uuid"
     }
   }
   ```

The function will:
- Use the provided `id`
- Automatically use "event" as the `sort` key

#### Output Format

The function returns a response with the following structure:

##### Success (HTTP 200)
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Event retrieved successfully",
    "event": {
      "id": "event-uuid",
      "sort": "event",
      "name": "Event Name",
      "timestamp": "2023-01-01T00:00:00.000Z",
      "description": "Event description",
      "metadata": {
        "field1": "value1",
        "field2": "value2"
      }
    }
  }
}
```

##### Error (HTTP 400 - Missing ID)
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Event ID is required"
  }
}
```

##### Error (HTTP 404 - Not Found)
```json
{
  "statusCode": 404,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Event not found"
  }
}
```

##### Error (HTTP 500 - Server Error)
```json
{
  "statusCode": 500,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "message": "Failed to retrieve event",
    "error": "Error message"
  }
}
```

## DynamoDB Table Structure

The functions use a DynamoDB table with the following composite primary key structure:
- Partition key: `id` (String) - A randomly generated UUID
- Sort key: `sort` (String) - Always set to "event" for event objects

The event object structure in DynamoDB:
```json
{
  "id": "randomly-generated-uuid",
  "sort": "event",
  "name": "Event Name",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "description": "Optional event description",
  "metadata": {
    "optional": "metadata fields"
  }
}
```

## Testing

### Local Testing

You can test both functions locally using the provided `test-local.js` script:

```bash
node test-local.js
```

This script:
1. Creates an event using the create function
2. Extracts the generated event ID
3. Uses that ID to test the read function

Note that for it to actually work with DynamoDB, you need valid AWS credentials with appropriate permissions.

### AWS Console Testing

#### Create Event Test

```json
{
  "body": {
    "name": "Test Event",
    "description": "This is a test event",
    "metadata": {
      "source": "console-test"
    }
  }
}
```

#### Read Event Test

```json
{
  "pathParameters": {
    "id": "event-uuid-from-create-response"
  }
}
```

### API Gateway Testing

#### Create Event

```bash
curl -X POST \
  https://your-api-id.execute-api.region.amazonaws.com/dev/events \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Event",
    "description": "This is a test event",
    "metadata": {
      "source": "curl-test"
    }
  }'
```

#### Read Event

```bash
curl -X GET \
  https://your-api-id.execute-api.region.amazonaws.com/dev/events/event-uuid-from-create-response
```
