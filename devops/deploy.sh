#!/bin/bash
cd /usr/local/repo/Todolist
git stash
git fetch
git checkout main
git pull 
npm install

if [[ $? -ne 0 ]]; then
    echo "install failed"
    exit 1
fi
pm2 delete todolist;

NODE_ENV=$1 pm2 start ecosystem.config.cjs