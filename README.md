# ByteBuddy - Event Management System

ByteBuddy is a full-stack event management application that allows users to create events, manage attendees, and search for people by keywords.

## Project Structure

The project is organized into two main directories:

- `server/`: Backend API built with AWS Lambda, API Gateway, and DynamoDB
- `client/`: Frontend React application

## Backend (server/)

The backend is built using:

- AWS Lambda functions (Node.js)
- Amazon API Gateway
- Amazon DynamoDB
- AWS CloudFormation for infrastructure as code

### Key Features

- Create and retrieve events
- Add, retrieve, and delete people associated with events
- Search for people by keywords
- Serverless architecture for scalability and cost-efficiency

### Deployment

The backend can be deployed using the provided CloudFormation template and deployment script:

```bash
cd server
./deploy.sh
```

For more details, see the [server README](server/README.md).

## Frontend (client/)

The frontend is built using:

- React
- React Router for navigation
- Bootstrap for styling
- Axios for API communication

### Key Features

- Single-page application with responsive design
- Event creation and management
- Person management within events
- Keyword search functionality

### Deployment

The frontend can be deployed to AWS using the provided CloudFormation template and deployment script:

```bash
cd client
./deploy.sh
```

For more details, see the [client README](client/README.md).

## Complete Deployment

To deploy the entire application:

1. Deploy the backend first:
   ```bash
   cd server
   ./deploy.sh
   ```

2. Deploy the frontend:
   ```bash
   cd client
   ./deploy.sh
   ```

The deployment scripts will:
- Create/update the necessary AWS resources
- Build and deploy the code
- Configure the integration between frontend and backend
- Output the URLs to access the application

## AWS Resources Used

- **Lambda**: Serverless compute for API endpoints
- **API Gateway**: HTTP API endpoints
- **DynamoDB**: NoSQL database for storing events and people
- **S3**: Static website hosting for the React app
- **CloudFront**: Content delivery network for the frontend
- **IAM**: Identity and access management for secure resource access
- **CloudFormation**: Infrastructure as code for repeatable deployments

## Local Development

### Backend

```bash
cd server
npm install
npm run test-local
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## AWS Profile Support

Both deployment scripts support AWS profiles. To use a specific AWS profile:

```bash
export AWS_PROFILE=your-profile-name
./deploy.sh
```

## Customization

- **Region**: Change the AWS region in the deployment scripts
- **Environment**: Deploy to different environments (dev, test, prod)
- **Domain**: Configure custom domains for the frontend
