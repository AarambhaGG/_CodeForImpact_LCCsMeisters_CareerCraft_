# Environment Configuration Guide

This document explains how to configure the environment variables for the CareerCraft application.

## Server Environment Variables

The backend server uses environment variables to configure API keys and model providers. Create a `.env` file in the `server/` directory with the following variables:

### Required Variables

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Model Provider Configuration (options: "openai" or "gemini")
MODEL_PROVIDER=gemini

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### Setup Instructions

1. Copy the `.env.example` file to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual API keys:
   - Get your OpenAI API key from https://platform.openai.com/api-keys
   - Get your Gemini API key from https://makersuite.google.com/app/apikey

3. Set the `MODEL_PROVIDER` to either "openai" or "gemini" based on which service you want to use

### Docker Configuration

The `docker-compose.yml` file is configured to automatically load the `.env` file using the `env_file` directive. When you run:

```bash
docker compose up -d --build
```

All environment variables from `.env` will be available to the Django application inside the container.

## Web Environment Variables

The Next.js frontend uses environment variables to configure the API endpoint. Create a `.env` file in the `web/` directory with the following variables:

### Required Variables

```bash
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Setup Instructions

1. Copy the `.env.example` file to `.env`:
   ```bash
   cd web
   cp .env.example .env
   ```

2. The default value points to the local Docker backend. If you deploy the backend to a different URL, update this value accordingly.

### Next.js Environment Variable Conventions

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- The variable is used in `services/axios.ts` to configure the API client
- After changing `.env`, restart the Next.js dev server to apply changes

## Security Notes

1. **Never commit `.env` files to version control**
   - Both `.gitignore` files are configured to exclude `.env` files
   - Use `.env.example` files as templates

2. **API Keys are sensitive**
   - Keep your API keys private
   - Rotate keys periodically
   - Use different keys for development and production

3. **Production Deployment**
   - Use environment variables provided by your hosting platform
   - Consider using secret management services
   - Set `DEBUG=False` in production Django settings

## Troubleshooting

### Backend can't access API keys

1. Verify the `.env` file exists in the `server/` directory
2. Check that `python-dotenv` is installed (it's in `requirements.txt`)
3. Verify `load_dotenv()` is called in `core/settings.py`
4. Restart the Docker container after changing `.env`

### Frontend can't connect to backend

1. Verify the `.env` file exists in the `web/` directory
2. Check that `NEXT_PUBLIC_API_BASE_URL` is set correctly
3. Restart the Next.js dev server after changing `.env`
4. Verify the backend is running on the specified URL

### Environment variables not loading in Docker

1. Check that `env_file: .env` is in `docker-compose.yml`
2. Rebuild the container: `docker compose up -d --build`
3. Check container logs: `docker compose logs backend`
