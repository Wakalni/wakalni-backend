# Use Node.js 20
FROM node:20-alpine

# Enable corepack for yarn
RUN corepack enable

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install ALL dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies to keep image small
RUN yarn install --production --frozen-lockfile

# Expose the port
EXPOSE 8000

# Start the application
CMD ["yarn", "start:prod"]