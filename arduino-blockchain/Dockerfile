# Step 1: Use Node.js official base image
FROM node:18

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package.json and install dependencies (if you have package.json)
COPY package*.json ./
RUN npm install

# Step 4: Copy all project files into container
COPY . .

# Step 5: Set default command to run your script
CMD ["node", "arduino-blockchain/readSensor.js"]
