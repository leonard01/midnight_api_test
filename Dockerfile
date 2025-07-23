FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install browsers and dependencies
RUN npx playwright install --with-deps

# Copy project files
COPY . .

# Run tests (reports saved to /app/playwright-report & /app/junit-results)
CMD ["npx", "playwright", "test"]
