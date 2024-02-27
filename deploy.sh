# echo "Switching to branch main"
# git checkout main

GREEN='\033[0;32m'
RED='\033[0;33m'

echo "Building app..."
npm run build

echo "Deploying files to server"
scp -r build/* linux2admin@192.168.100.226:/var/www/192.168.100.226/

echo -e "${GREEN}Deployment Successful!"

