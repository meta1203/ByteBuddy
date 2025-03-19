#!/bin/bash
# Script to deploy the React app to AWS using CloudFormation

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="byte-buddy-frontend"
TEMPLATE_FILE="cloudformation.yaml"
REGION="us-east-1"  # Change to your preferred region
ENVIRONMENT="dev"   # Change to your preferred environment (dev, test, prod)
DOMAIN_NAME=""      # Optional: Domain name for the CloudFront distribution
CERTIFICATE_ARN=""  # Optional: ARN of the SSL certificate for the CloudFront distribution

# AWS Profile handling
AWS_PROFILE_PARAM=""
if [ -n "$AWS_PROFILE" ]; then
    echo -e "${GREEN}Using AWS Profile: ${AWS_PROFILE}${NC}"
    AWS_PROFILE_PARAM="--profile $AWS_PROFILE"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Get the API Gateway endpoint from the server stack
echo -e "${GREEN}Getting API Gateway endpoint from server stack...${NC}"
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name byte-buddy \
    --region $REGION \
    $AWS_PROFILE_PARAM \
    --query "Stacks[0].Outputs[?OutputKey=='CreateEventApiEndpoint'].OutputValue" \
    --output text)

if [ -z "$API_ENDPOINT" ]; then
    echo -e "${YELLOW}Warning: Could not get API Gateway endpoint from server stack.${NC}"
    echo -e "${YELLOW}Please enter the API Gateway endpoint manually:${NC}"
    read API_ENDPOINT
fi

echo -e "${GREEN}API Gateway endpoint: ${API_ENDPOINT}${NC}"

# Build the React app
echo -e "${GREEN}Building React app...${NC}"
npm run build

# Check if the CloudFormation stack already exists
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_PARAM \
    --query "Stacks[0].StackName" \
    --output text 2>/dev/null || echo "")

if [ -z "$STACK_EXISTS" ]; then
    # Create the CloudFormation stack
    echo -e "${GREEN}Creating CloudFormation stack...${NC}"
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $REGION \
        --capabilities CAPABILITY_IAM \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ApiEndpoint,ParameterValue=$API_ENDPOINT \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=CertificateARN,ParameterValue=$CERTIFICATE_ARN \
        $AWS_PROFILE_PARAM

    echo -e "${GREEN}Waiting for stack creation to complete...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION \
        $AWS_PROFILE_PARAM
else
    # Update the CloudFormation stack
    echo -e "${GREEN}Updating CloudFormation stack...${NC}"
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $REGION \
        --capabilities CAPABILITY_IAM \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ApiEndpoint,ParameterValue=$API_ENDPOINT \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=CertificateARN,ParameterValue=$CERTIFICATE_ARN \
        $AWS_PROFILE_PARAM || {
            echo -e "${YELLOW}No updates to be performed or stack update failed.${NC}"
        }

    echo -e "${GREEN}Waiting for stack update to complete...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION \
        $AWS_PROFILE_PARAM || {
            echo -e "${YELLOW}Stack update may have failed or no updates were performed.${NC}"
        }
fi

# Get the CloudFront distribution domain name
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_PARAM \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" \
    --output text)

# Get the S3 bucket name
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_PARAM \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" \
    --output text)

# Upload the built React app to S3
echo -e "${GREEN}Uploading built React app to S3...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --delete \
    --region $REGION \
    $AWS_PROFILE_PARAM

# Create CloudFront invalidation
echo -e "${GREEN}Creating CloudFront invalidation...${NC}"
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_PARAM \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*" \
    $AWS_PROFILE_PARAM

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Website URL: https://${CLOUDFRONT_DOMAIN}${NC}"

if [ -n "$DOMAIN_NAME" ]; then
    echo -e "${GREEN}Custom Domain URL: https://${DOMAIN_NAME}${NC}"
    echo -e "${YELLOW}Note: Make sure your DNS is configured to point to the CloudFront distribution.${NC}"
fi
