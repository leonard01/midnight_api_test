FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install
# Or use strict install (if lockfile fixed)
# RUN npm ci

# Install browser dependencies
RUN npx playwright install --with-deps

# Copy the rest of the project
COPY . .

CMD ["npx", "playwright", "test"]
