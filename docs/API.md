# API Documentation - Video Creator AI

## Overview

The Video Creator AI API provides endpoints for generating educational videos using artificial intelligence. The API supports script generation, text-to-speech conversion, media search, and subtitle generation.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://api.videocreator.ai`

## Interactive Documentation

When the server is running, you can access the interactive Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Authentication

Currently, the API uses environment variables for authentication. In production, implement API key authentication using the `X-API-Key` header.

## Endpoints

### 1. Generate Script
**POST** `/api/generate-script`

Generates a video script based on a text prompt using AI.

**Request Body:**
```json
{
  "prompt": "Crie um vídeo sobre os benefícios da meditação"
}
```

**Response:**
```json
{
  "titulo": "Os Benefícios da Meditação",
  "introducao": "Bem-vindo ao nosso vídeo...",
  "segmentos": [
    {
      "titulo": "Redução do Estresse",
      "conteudo": "A meditação ajuda a reduzir...",
      "duracao": 5
    }
  ],
  "conclusao": "Em resumo, a meditação..."
}
```

### 2. Generate Audio with Timing
**POST** `/api/generate-audio-with-timing`

Converts text segments to speech with timing information.

**Request Body:**
```json
{
  "segments": [
    {
      "text": "Olá, bem-vindo ao vídeo",
      "duration": 3
    }
  ],
  "voiceName": "pt-BR-FranciscaNeural",
  "speakingRate": 1.0
}
```

**Response:**
```json
{
  "audioBase64": "data:audio/mp3;base64,...",
  "segments": [
    {
      "text": "Olá, bem-vindo ao vídeo",
      "startTime": 0,
      "endTime": 3.2,
      "duration": 3.2
    }
  ],
  "totalDuration": 3.2
}
```

### 3. Search Media
**GET** `/api/search-media`

Searches for videos, images, or GIFs from multiple sources.

**Query Parameters:**
- `query` (required): Search keywords
- `type` (optional): Media type (`video`, `image`, `gif`)
- `count` (optional): Number of results (1-50, default: 10)

**Example:**
```
GET /api/search-media?query=natureza&type=video&count=5
```

**Response:**
```json
{
  "results": [
    {
      "id": "123",
      "url": "https://example.com/video.mp4",
      "tipo": "video",
      "duracao": 30,
      "descricao": "Beautiful nature video",
      "creditos": "John Doe",
      "fonte": "pexels"
    }
  ],
  "total": 5,
  "fonte": "pexels"
}
```

### 4. Generate Subtitles
**POST** `/api/generate-subtitles`

Generates subtitles in WebVTT format from text segments.

**Request Body:**
```json
{
  "segments": [
    {
      "text": "Primeira legenda",
      "startTime": 0,
      "endTime": 3
    },
    {
      "text": "Segunda legenda",
      "startTime": 3,
      "endTime": 6
    }
  ]
}
```

**Response:**
```json
{
  "subtitles": [
    {
      "text": "Primeira legenda",
      "startTime": 0,
      "endTime": 3
    }
  ],
  "webvtt": "WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nPrimeira legenda\n\n00:00:03.000 --> 00:00:06.000\nSegunda legenda"
}
```

### 5. Health Check
**GET** `/api/health`

Checks the health status of the API and external services.

**Response:**
```json
{
  "status": "healthy",
  "apis": {
    "openai": "operational",
    "googleTts": "operational",
    "unsplash": "operational",
    "pexels": "operational",
    "giphy": "operational"
  },
  "metrics": {
    "uptime": "3600s",
    "requests": {
      "total": 1000,
      "success": 980,
      "error": 20
    },
    "successRate": "98.00%",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## Rate Limits

- **AI Generation** (`/api/generate-script`): 20 requests per 15 minutes
- **Audio Generation** (`/api/generate-audio-with-timing`): 30 requests per 15 minutes
- **Media Search** (`/api/search-media`): 50 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": {},
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid API credentials)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Voice Options

Available voices for text-to-speech:

### Google Cloud Voices
- `pt-BR-Wavenet-A` (Female)
- `pt-BR-Wavenet-B` (Male)
- `pt-BR-Wavenet-C` (Male)
- `pt-BR-Neural2-A` (Female)
- `pt-BR-Neural2-B` (Male)
- `pt-BR-Neural2-C` (Female)

### Microsoft Neural Voices
- `pt-BR-FranciscaNeural` (Female)
- `pt-BR-AntonioNeural` (Male)

## Media Sources

The API searches media from:
- **Pexels**: High-quality stock videos and images
- **Giphy**: Animated GIFs
- **Unsplash**: High-resolution images

## Best Practices

1. **Error Handling**: Always check for error responses and handle them appropriately
2. **Rate Limiting**: Implement backoff strategies when hitting rate limits
3. **Caching**: Cache media search results to reduce API calls
4. **Timeouts**: Set appropriate timeouts (30s recommended)
5. **Validation**: Validate inputs before sending requests

## Example Implementation

```javascript
// Generate a complete video
async function createVideo(topic) {
  try {
    // 1. Generate script
    const scriptRes = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: topic })
    });
    const script = await scriptRes.json();
    
    // 2. Generate audio
    const audioRes = await fetch('/api/generate-audio-with-timing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: script.segmentos.map(s => ({ text: s.conteudo })),
        voiceName: 'pt-BR-FranciscaNeural'
      })
    });
    const audio = await audioRes.json();
    
    // 3. Search for media
    const mediaRes = await fetch(`/api/search-media?query=${encodeURIComponent(topic)}&type=video`);
    const media = await mediaRes.json();
    
    // 4. Generate subtitles
    const subtitlesRes = await fetch('/api/generate-subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments: audio.segments })
    });
    const subtitles = await subtitlesRes.json();
    
    return { script, audio, media, subtitles };
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}
```