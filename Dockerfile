# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install development dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose Vite's default local network port
EXPOSE 5173

# Start the Vite local development server with the --host flag so the network is accessible
CMD ["npm", "run", "dev", "--", "--host"]