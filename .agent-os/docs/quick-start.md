# Quick Start Guide

## Prerequisites
- Node.js v18+ (tested on v24)
- API Keys for: OpenAI, Google Cloud, Pexels, Giphy, Unsplash

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/media.git
cd media

# Install dependencies
npm install

# Configure environment variables
cp config/.env.example .env
# Edit .env with your API keys
```

## Running the Application

```bash
# Start the server
npm start

# Or with all environment variables:
export OPENAI_API_KEY="your-key" && \
export GOOGLE_API_KEY="your-key" && \
export PEXELS_API_KEY="your-key" && \
export GIPHY_API_KEY="your-key" && \
export UNSPLASH_ACCESS_KEY="your-key" && \
node src/server.js
```

## Usage

1. Open http://localhost:3000
2. Enter a video description (e.g., "Crie um vídeo sobre fotossíntese")
3. Select voice and settings
4. Click "Gerar Vídeo"
5. Preview with "Reproduzir Prévia"
6. Export with "Baixar Vídeo MP4"

## API Keys Setup

### OpenAI
- Visit: https://platform.openai.com/api-keys
- Create new secret key
- Add to OPENAI_API_KEY

### Google Cloud TTS
- Visit: https://console.cloud.google.com
- Enable Text-to-Speech API
- Create API key with TTS restrictions
- Add to GOOGLE_API_KEY

### Media APIs
- Pexels: https://www.pexels.com/api/
- Giphy: https://developers.giphy.com/
- Unsplash: https://unsplash.com/developers