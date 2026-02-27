# ═══════════════════════════════════════════════════════════════════════════════
# AGRI-मित्र — AWS Deployment Guide
# ═══════════════════════════════════════════════════════════════════════════════

## Quick Deploy to AWS EC2

### Prerequisites
- AWS account with EC2 access
- Key pair (.pem file) for SSH
- Security group allowing ports 22 (SSH) and 8000 (API)

---

### Step 1: Launch EC2 Instance
1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose **Amazon Linux 2023** or **Ubuntu 22.04**
3. Instance type: **t3.small** (minimum) or **t3.medium** (recommended)
4. Storage: 20 GB gp3
5. Security Group: Allow **SSH (22)**, **HTTP (80)**, **Custom TCP (8000)**
6. Download the key pair (.pem)

### Step 2: Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
# For Ubuntu: ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Install Docker on EC2
```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Log out and back in for group changes

# Ubuntu 22.04
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

### Step 4: Clone & Deploy
```bash
# Clone your repo (or SCP the files)
git clone <YOUR_REPO_URL> agrimitra
cd agrimitra/agrichain-backend

# Create .env file with your API keys
cat > .env << 'EOF'
NODE_ENV=production
SECRET_KEY=your-strong-random-secret-key-here
DATABASE_URL=sqlite:///./data/agrimitra.db
GOOGLE_API_KEY=your-google-api-key
OPENWEATHER_API_KEY=your-openweather-key
CORS_ORIGINS=*
LOG_LEVEL=INFO
EOF

# Build and run
docker build -t agrimitra-backend .
docker run -d \
  --name agrimitra-api \
  -p 8000:8000 \
  --env-file .env \
  -v agrimitra-data:/app/data \
  --restart unless-stopped \
  agrimitra-backend

# Verify it's running
curl http://localhost:8000/health
```

### Step 5: (Optional) Set Up Nginx Reverse Proxy with HTTPS
```bash
sudo yum install -y nginx   # Amazon Linux
# OR
sudo apt install -y nginx   # Ubuntu

# Configure nginx
sudo tee /etc/nginx/conf.d/agrimitra.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
EOF

sudo systemctl restart nginx
```

---

## Alternative: Deploy WITHOUT Docker

```bash
# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip   # Amazon Linux
# OR
sudo apt install -y python3.11 python3.11-venv   # Ubuntu

# Setup
cd agrichain-backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env (same as above)

# Run with gunicorn
gunicorn main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120 &

# Or create a systemd service for auto-restart
sudo tee /etc/systemd/system/agrimitra.service << 'EOF'
[Unit]
Description=AGRI-Mitra Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/agrimitra/agrichain-backend
Environment=PATH=/home/ec2-user/agrimitra/agrichain-backend/venv/bin
ExecStart=/home/ec2-user/agrimitra/agrichain-backend/venv/bin/gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 2 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable agrimitra
sudo systemctl start agrimitra
```

---

## Update the Mobile App

After deploying, update the backend URL in your mobile app:

**File: `AgriChain/src/services/ariaService.js`**
```js
const BACKEND_URL = 'http://<EC2-PUBLIC-IP>:8000';
```

**File: `AgriChain/src/context/AuthContext.js`**
```js
const BASE_URL = 'http://<EC2-PUBLIC-IP>:8000';
```

Or better — set `EXPO_PUBLIC_BACKEND_URL` in your `.env`:
```
EXPO_PUBLIC_BACKEND_URL=http://<EC2-PUBLIC-IP>:8000
```

---

## Useful Commands

```bash
# View logs
docker logs -f agrimitra-api

# Restart
docker restart agrimitra-api

# Update deployment
docker stop agrimitra-api && docker rm agrimitra-api
docker build -t agrimitra-backend .
docker run -d --name agrimitra-api -p 8000:8000 --env-file .env -v agrimitra-data:/app/data --restart unless-stopped agrimitra-backend

# Check health
curl http://<EC2-PUBLIC-IP>:8000/health
```
