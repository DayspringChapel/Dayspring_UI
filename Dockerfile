# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Creates a CNAME file for Github Pages
# RUN echo "subdomain.yourdomain.com" > CNAME

# Generate the build
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "dist"]