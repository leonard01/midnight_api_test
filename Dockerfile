# 🟢 Clean Playwright base image
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all remaining files
COPY . .

# 🟢 Explicitly run tests
CMD ["npx", "playwright", "test"]
