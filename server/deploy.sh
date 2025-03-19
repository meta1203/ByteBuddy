#!/bin/bash
# Script to deploy the Lambda functions to AWS

# Exit on error
set -e

# Configuration
REGION="us-east-1"  # Change to your preferred region
STACK_NAME="byte-buddy"  # CloudFormation stack name
TEMPLATE_FILE="template.yaml"  # CloudFormation template file
S3_BUCKET=""        # Optional: S3 bucket for deployment package

# AWS Profile handling
AWS_PROFILE_PARAM=""
if [ -n "$AWS_PROFILE" ]; then
    echo -e "${GREEN}Using AWS Profile: ${AWS_PROFILE}${NC}"
    AWS_PROFILE_PARAM="--profile $AWS_PROFILE"
fi


# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo -e "${YELLOW}Warning: AWS SAM CLI is not installed. Using AWS CLI for deployment.${NC}"
    SAM_INSTALLED=false
else
    SAM_INSTALLED=true
fi

# Install production dependencies
echo -e "${GREEN}Installing production dependencies...${NC}"
npm install --production

# Deploy using AWS SAM or AWS CloudFormation
if [ "$SAM_INSTALLED" = true ]; then
    echo -e "\n${GREEN}=== Deploying with AWS SAM ===${NC}"
    
    # Build the SAM application
    echo -e "${GREEN}Building SAM application...${NC}"
    sam build $AWS_PROFILE_PARAM
    
    # Deploy the SAM application
    echo -e "${GREEN}Deploying SAM application...${NC}"
    sam deploy --stack-name $STACK_NAME \
               --region $REGION \
               --capabilities CAPABILITY_IAM \
               --no-fail-on-empty-changeset \
               $AWS_PROFILE_PARAM
else
    echo -e "\n${GREEN}=== Deploying with AWS CloudFormation ===${NC}"
    
    # Check if S3 bucket is provided for deployment package
    if [ -z "$S3_BUCKET" ]; then
        echo -e "${YELLOW}No S3 bucket provided. Creating a temporary one for deployment.${NC}"
        
        # Generate a unique bucket name
        TIMESTAMP=$(date +%s)
        S3_BUCKET="byte-buddy-deployment-$TIMESTAMP"
        
        # Create the S3 bucket
        aws s3 mb s3://$S3_BUCKET --region $REGION $AWS_PROFILE_PARAM
        
        # Enable versioning on the bucket
        aws s3api put-bucket-versioning --bucket $S3_BUCKET --versioning-configuration Status=Enabled $AWS_PROFILE_PARAM
        
        # Flag to delete the bucket after deployment
        DELETE_BUCKET=true
    else
        DELETE_BUCKET=false
    fi
    
    # Package the CloudFormation template
    echo -e "${GREEN}Packaging CloudFormation template...${NC}"
    aws cloudformation package \
        --template-file $TEMPLATE_FILE \
        --s3-bucket $S3_BUCKET \
        --output-template-file packaged-template.yaml \
        --region $REGION \
        $AWS_PROFILE_PARAM
    
    # Deploy the CloudFormation stack
    echo -e "${GREEN}Deploying CloudFormation stack...${NC}"
    aws cloudformation deploy \
        --template-file packaged-template.yaml \
        --stack-name $STACK_NAME \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --no-fail-on-empty-changeset \
        $AWS_PROFILE_PARAM
    
    # Clean up the temporary S3 bucket if created
    if [ "$DELETE_BUCKET" = true ]; then
        echo -e "${GREEN}Cleaning up temporary S3 bucket...${NC}"
        aws s3 rb s3://$S3_BUCKET --force $AWS_PROFILE_PARAM
    fi
    
    # Clean up the packaged template
    rm -f packaged-template.yaml
fi

# Display the stack outputs
echo -e "\n${GREEN}=== Deployment Outputs ===${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query "Stacks[0].Outputs" \
    --output table \
    $AWS_PROFILE_PARAM

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Note: The DynamoDB table and IAM role have been created automatically.${NC}"
echo -e "${YELLOW}API Gateway endpoints are available in the outputs above.${NC}"
