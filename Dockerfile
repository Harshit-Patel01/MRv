FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (conditionally include dev dependencies)
RUN if [ "$NODE_ENV" = "production" ] ; then npm ci --only=production ; else npm ci ; fi

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Default to production mode if not specified
ENV NODE_ENV=production

# Run the application
CMD ["node", "server.js"]
