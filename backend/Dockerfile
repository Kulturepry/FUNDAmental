FROM node:18-slim

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy Prisma schema first
COPY prisma ./prisma/

# Install dependencies (this will trigger postinstall script)
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Make startup script executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 3001

# Start the application with database setup
CMD ["./start.sh"] 