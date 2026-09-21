# Multi-Stage Dockerfile for MACHINEX Full-Stack B2B Marketplace

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

# Install Backend Dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy Backend Source and Seed Data
COPY backend/ ./backend/
COPY database/ ./database/

# Copy Built Frontend Assets into backend's static target path
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Web Port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/backend
CMD ["node", "server.js"]
