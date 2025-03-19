# ByteBuddy Frontend

This is the frontend React application for ByteBuddy, an event management system.

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

## Deployment to AWS

The application can be deployed to AWS using CloudFormation, which will:

1. Create an S3 bucket to host the static files
2. Set up a CloudFront distribution for global content delivery
3. Configure the API Gateway endpoint for backend communication

### Prerequisites

- AWS CLI installed and configured
- AWS account with appropriate permissions
- Backend API deployed (using the server's CloudFormation template)

### Deployment Steps

1. Build and deploy the backend first (from the server directory):

```bash
cd ../server
./deploy.sh
```

2. Deploy the frontend:

```bash
cd ../client
./deploy.sh
```

The deployment script will:
- Build the React application
- Create/update the CloudFormation stack
- Upload the built files to S3
- Create a CloudFront invalidation to refresh the cache

### Configuration

You can modify the following parameters in the `deploy.sh` script:

- `STACK_NAME`: Name of the CloudFormation stack
- `REGION`: AWS region to deploy to
- `ENVIRONMENT`: Deployment environment (dev, test, prod)
- `DOMAIN_NAME`: Custom domain name (optional)
- `CERTIFICATE_ARN`: SSL certificate ARN for custom domain (optional)

### Using a Custom Domain

To use a custom domain:

1. Register a domain in Route 53 or with another registrar
2. Create an SSL certificate in AWS Certificate Manager
3. Update the `DOMAIN_NAME` and `CERTIFICATE_ARN` variables in `deploy.sh`
4. Run the deployment script
5. Configure your DNS to point to the CloudFront distribution

## Project Structure

- `src/`: Source code for the React application
  - `components/`: React components
  - `api.js`: API service for backend communication
- `public/`: Static assets
- `cloudformation.yaml`: CloudFormation template for AWS deployment
- `deploy.sh`: Deployment script

## Environment Variables

The application uses the following environment variables:

- `API_ENDPOINT`: The API Gateway endpoint URL (set automatically during deployment)

## Troubleshooting

### CloudFront Cache

If you don't see your changes after deployment, the CloudFront cache might need to be invalidated:

```bash
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

### CORS Issues

If you encounter CORS issues, ensure that the API Gateway has the appropriate CORS configuration.

### S3 Bucket Access

The S3 bucket is configured with private access, and content is served through CloudFront. If you need to access the bucket directly, you'll need to update the bucket policy.
