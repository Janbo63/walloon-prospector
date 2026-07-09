# Walloon Prospector — Direct VPS Deployment Script (PowerShell Native)
# Run this from your local machine in PowerShell:
# .\deploy-vps.ps1

$commands = @'
set -e
echo "🚀 Starting Walloon Prospector deployment on VPS..."

# Setup directories if they don't exist
sudo mkdir -p /var/www/walloon-prospector
sudo chown -R eviscout:eviscout /var/www/walloon-prospector

# Navigate to app directory
cd /var/www/walloon-prospector

# Check if git repository is initialized
if [ ! -d ".git" ]; then
  echo "📥 Cloning repository..."
  git clone https://github.com/Janbo63/walloon-prospector.git .
else
  # Ensure git safe.directory is set
  git config --global --add safe.directory /var/www/walloon-prospector 2>/dev/null || true
  # Pull latest changes
  echo "📥 Pulling latest code from GitHub..."
  git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Apply any schema changes (isolated in walloon_prospector schema)
echo "🗄️ Applying database schema..."
npx prisma db push --accept-data-loss

# Build application
echo "🏗️ Building application..."
npm run build

# Fix file ownership
echo "🔑 Fixing file ownership..."
chown -R eviscout:eviscout /var/www/walloon-prospector 2>/dev/null || true

# Restart PM2 on port 3500
echo "♻️ Restarting application..."
sudo fuser -k 3500/tcp 2>/dev/null || true
sleep 1
sudo pm2 restart walloon-prospector 2>/dev/null || sudo pm2 start node_modules/.bin/next --name walloon-prospector -- start -p 3500

# Save PM2 process list
sudo pm2 save

echo "✅ Deployment complete!"
echo "🌐 Walloon Prospector running on port 3500"
'@

Write-Host "🚀 Starting remote deployment to VPS..." -ForegroundColor Yellow
$commands | ssh -i C:\Users\jan\.ssh\id_rsa eviscout@46.202.129.30 "bash"
