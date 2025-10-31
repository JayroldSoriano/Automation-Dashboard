#!/bin/bash

# Deployment script for Automation Dashboard
# This script helps automate the deployment process to AWS EC2

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="ubuntu@arcwaynexus.com"
SSH_KEY="${HOME}/ssh/n8n_automation_workflow.pem"
EC2_PROJECT_PATH="~/automation-dashboard"

# Verify SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    echo "Please update the SSH_KEY path in deploy.sh or create the key file."
    exit 1
fi

# Set proper permissions on SSH key (required by SSH)
chmod 600 "$SSH_KEY" 2>/dev/null || true

echo -e "${GREEN}Using SSH key: $SSH_KEY${NC}\n"

echo -e "${GREEN}=== Automation Dashboard Deployment Script ===${NC}\n"

# Test SSH connection first
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ssh $SSH_OPTS -o BatchMode=yes $EC2_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SSH connection verified${NC}\n"
else
    echo -e "${YELLOW}Warning: Could not verify SSH connection in batch mode.${NC}"
    echo -e "${YELLOW}This is normal for first-time connections. Continuing...${NC}\n"
fi

# Step 1: Build web version locally
echo -e "${YELLOW}Step 1: Building web version...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building web version..."
npx expo export --platform web

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist folder not found after build!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Web build completed${NC}\n"

# Step 2: Ask user for deployment method
echo -e "${YELLOW}Step 2: Choose deployment method:${NC}"
echo "1) Transfer files and build on EC2 (recommended for first deployment)"
echo "2) Transfer only built files (faster for updates)"
read -p "Enter choice [1 or 2]: " deploy_method

# Step 3: Transfer files
echo -e "\n${YELLOW}Step 3: Transferring files to EC2...${NC}"

# SSH options (auto-accept host key on first connection, save it for future)
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

if [ "$deploy_method" == "1" ]; then
    # Transfer entire project (excluding node_modules, .git, dist)
    echo "Transferring project files (excluding node_modules, .git, dist)..."
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
        -e "ssh $SSH_OPTS" \
        . $EC2_HOST:$EC2_PROJECT_PATH/
elif [ "$deploy_method" == "2" ]; then
    # Transfer only dist folder
    echo "Transferring built files..."
    rsync -avz dist/ \
        -e "ssh $SSH_OPTS" \
        $EC2_HOST:$EC2_PROJECT_PATH/dist/
else
    echo -e "${RED}Invalid choice!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Files transferred${NC}\n"

# Step 4: Build and deploy on EC2
echo -e "${YELLOW}Step 4: Building and deploying on EC2...${NC}"

if [ "$deploy_method" == "1" ]; then
    # SSH into EC2 and build
    ssh $SSH_OPTS $EC2_HOST << 'ENDSSH'
        cd ~/automation-dashboard
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies on EC2..."
            npm install
        fi
        
        # Build web version
        echo "Building web version on EC2..."
        npx expo export --platform web
        
        # Deploy with Docker Compose
        echo "Deploying with Docker Compose..."
        docker-compose down
        docker-compose build
        docker-compose up -d
        
        echo "Deployment complete!"
        echo "Checking container status..."
        docker-compose ps
ENDSSH
else
    # Just restart the container
    ssh $SSH_OPTS $EC2_HOST << 'ENDSSH'
        cd ~/automation-dashboard
        
        # Rebuild and restart container
        echo "Restarting container with new build..."
        docker-compose down
        docker-compose build
        docker-compose up -d
        
        echo "Deployment complete!"
        echo "Checking container status..."
        docker-compose ps
ENDSSH
fi

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Access your dashboard at: ${YELLOW}http://arcwaynexus.com:3000${NC}"
echo -e "Or check your Nginx configuration if you've set up a reverse proxy."

