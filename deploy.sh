 #!/bin/bash
echo "Start deployment"
git reset --hard origin/master
git clean -f
git pull origin master
npm install
npm run test
echo "Finished."
