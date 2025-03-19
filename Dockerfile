# Base image
FROM node:lts-buster

# Set working directory
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && npm install -g pm2

# Copy rest of the files
COPY . .

# Expose necessary ports
EXPOSE 9090

# Start the application
CMD ["pm2-runtime", "start", "main.js", "--name", "Sarkar-MD"]
