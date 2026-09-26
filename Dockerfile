FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY server ./server
COPY package.json ./

# Expose port
EXPOSE 10000

ENV PORT=10000
ENV NODE_ENV=production

# Start backend server
CMD ["node", "server/index.js"]
