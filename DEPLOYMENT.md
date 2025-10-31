# AWS EC2 Deployment Guide

This guide will help you deploy the Automation Dashboard to your AWS EC2 instance running alongside your n8n instance.

## Prerequisites

- AWS EC2 instance with Docker and Docker Compose installed
- SSH access to your EC2 instance
- The project built for web (dist folder)

## Step 1: Prepare Your Local Environment

### 1.1 Build the Web Version

First, ensure you have all dependencies installed and build the web version:

```bash
# Install dependencies
npm install

# Build the web version
npx expo export --platform web
```

This will create a `dist/` folder with the production-ready web build.

## Step 2: Transfer Files to EC2

### Option A: Using SCP (Recommended for first deployment)

```bash
# From your local machine, transfer the entire project
cd /Users/jayroldchristiansoriano/Automation-Dashboard

# Transfer project files (excluding node_modules)
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
  -e "ssh -i ~/ssh/n8n_automation_workflow.pem" \
  . ubuntu@arcwaynexus.com:~/automation-dashboard/
```

### Option B: Using Git (Recommended for updates)

If your project is in a Git repository:

```bash
# SSH into your EC2 instance
ssh -i ~/ssh/n8n_automation_workflow.pem ubuntu@arcwaynexus.com

# Clone or pull your repository
cd ~
git clone <your-repo-url> automation-dashboard
# OR if already cloned:
cd ~/automation-dashboard
git pull
```

## Step 3: Set Up on EC2 Instance

### 3.1 SSH into Your EC2 Instance

```bash
ssh -i ~/ssh/n8n_automation_workflow.pem ubuntu@arcwaynexus.com
```

### 3.2 Install Required Dependencies on EC2

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (required for building)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version
npm --version
docker --version
docker-compose --version
```

### 3.3 Build the Web Version on EC2

```bash
cd ~/automation-dashboard

# Install dependencies
npm install

# Build the web version
npx expo export --platform web

# Verify dist folder was created
ls -la dist/
```

## Step 4: Configure Docker Compose

### 4.1 Update Docker Compose for Multiple Services

If you want to run both n8n and the dashboard together, you can create a combined `docker-compose.yml` or keep them separate. 

**Option A: Separate docker-compose.yml files** (Recommended)

Keep n8n's docker-compose.yml as is, and use the provided `docker-compose.yml` for the dashboard.

**Option B: Combined docker-compose.yml**

If you want both services in one file, create a combined version:

```yaml
version: '3.8'

services:
  n8n:
    # Your existing n8n configuration here
    # ... (keep your existing n8n service config)
    networks:
      - automation-network

  automation-dashboard:
    build:
      context: ~/automation-dashboard
      dockerfile: Dockerfile
    container_name: automation-dashboard
    restart: unless-stopped
    ports:
      - "3000:80"
    volumes:
      - ~/automation-dashboard/dist:/usr/share/nginx/html:ro
    networks:
      - automation-network

networks:
  automation-network:
    driver: bridge
```

## Step 5: Deploy with Docker Compose

### 5.1 Navigate to Project Directory

```bash
cd ~/automation-dashboard
```

### 5.2 Build and Start the Container

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f automation-dashboard
```

### 5.3 Verify Deployment

```bash
# Check if container is running
docker ps | grep automation-dashboard

# Test the web server
curl http://localhost:3000
```

## Step 6: Configure Nginx Reverse Proxy (Optional but Recommended)

If you want to serve the dashboard on a subdomain or path alongside n8n:

### 6.1 Install Nginx (if not already installed)

```bash
sudo apt install nginx -y
```

### 6.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/automation-dashboard
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name dashboard.arcwaynexus.com;  # Change to your desired subdomain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/automation-dashboard /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 6.4 Set Up SSL with Let's Encrypt (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d dashboard.arcwaynexus.com
```

## Step 7: Updating the Application

When you make changes and need to redeploy:

```bash
# SSH into EC2
ssh -i ~/ssh/n8n_automation_workflow.pem ubuntu@arcwaynexus.com

# Navigate to project
cd ~/automation-dashboard

# Pull latest changes (if using Git)
git pull

# Rebuild web version
npx expo export --platform web

# Rebuild and restart Docker container
docker-compose down
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f automation-dashboard
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs automation-dashboard

# Check if port is already in use
sudo netstat -tulpn | grep :3000

# Remove old container if needed
docker-compose down
docker-compose up -d --force-recreate
```

### Build fails

```bash
# Ensure dist folder exists
ls -la dist/

# Rebuild manually
npx expo export --platform web

# Check Node.js version (should be 16+)
node --version
```

### Permission issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER ~/automation-dashboard
chmod -R 755 ~/automation-dashboard
```

### Port conflicts

If port 3000 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Use different host port
```

## Security Considerations

1. **Firewall**: Ensure your EC2 security group allows traffic on the necessary ports:
   - Port 80 (HTTP) - for Nginx
   - Port 443 (HTTPS) - for Nginx with SSL
   - Port 3000 (only needed if not using Nginx reverse proxy)

2. **Environment Variables**: If your app uses environment variables, consider using:
   ```bash
   # Create .env file
   nano ~/automation-dashboard/.env
   ```
   And update docker-compose.yml to load it.

3. **SSL Certificate**: Always use HTTPS in production.

## Accessing Your Dashboard

- **Direct Docker**: `http://arcwaynexus.com:3000`
- **Via Nginx**: `http://dashboard.arcwaynexus.com` (if configured)
- **Via Nginx with SSL**: `https://dashboard.arcwaynexus.com` (if configured)

## Maintenance Commands

```bash
# Stop the dashboard
docker-compose down

# Start the dashboard
docker-compose up -d

# View logs
docker-compose logs -f

# Restart after changes
docker-compose restart

# Remove everything (including volumes)
docker-compose down -v
```

