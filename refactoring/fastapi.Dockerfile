# Base image
FROM python:3.12.8-alpine3.20 AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    WORKDIR=/app/backend

# Install required system packages and create user
RUN apk add --no-cache curl && \
    addgroup -S fastapi && adduser -S fastapi -G fastapi

# Set working directory
WORKDIR $WORKDIR
COPY app/backend .
RUN chown -R fastapi:fastapi /app
COPY requirements.txt requirements.txt
USER fastapi

# Dev
FROM base AS dev
COPY requirements-dev.txt requirements-dev.txt
RUN pip install --upgrade -r requirements-dev.txt
COPY app/backend/tests/ tests/

# Prod
FROM base AS prod
RUN pip install --upgrade -r requirements.txt
