FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl libssl1.1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client with specific binary target
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 