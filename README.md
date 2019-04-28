# Raider Server

This is the raider server for the raider client.

## Requirements:
1. Node.js
2. MongoDB

## Prepations:
1. If not installed, install a mongo db server. If the mongodb is running create a mongo user
2. change all values with '\<uservalue>' in the config file found in the src folder
4. install all dependencies with 'npm install'
3. create a private key, with openssl or anything like that, and save the into the keys folder

## Run Dev server:
Then you could start the dev server with 'npm run dev'. Change and save anything will recompile and restart the server

## Build server:
With 'npm run build' you could build the server. After that you could start the server with 'npm start'