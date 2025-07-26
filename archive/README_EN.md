# PROJECT_text-to-video - AI Video Creator

A natural language interface for creating production-ready educational videos for social media. Simply describe what you want, and the app generates a 30-second video complete with script, images, and voice narration.

## Features

- **Natural Language Interface**: Describe your video in plain English
- **Automatic Script Generation**: Creates educational scripts optimized for 30-second format
- **Smart Scene Breakdown**: Automatically segments content into visual scenes
- **Image Generation Ready**: Structured for integration with image generation APIs
- **Text-to-Speech Ready**: Prepared for Google Cloud Text-to-Speech integration
- **Visual Timeline**: Interactive timeline showing scene progression
- **Customizable Settings**: Voice selection, speech rate, and visual style options

## Current Status

The application provides a complete UI and workflow structure. To make it fully functional, you'll need to integrate:

1. **AI Script Generation** (OpenAI API, Claude API, or similar)
2. **Image Generation** (DALL-E, Stable Diffusion, or Unsplash API)
3. **Text-to-Speech** (Google Cloud TTS or Web Speech API)
4. **Video Export** (FFmpeg.wasm or server-side processing)

## Quick Start

1. Open `index.html` in a web browser
2. Enter a video description (e.g., "Create a video about the water cycle for kids")
3. Click "Generate Video" to see the workflow in action
4. The app will simulate the generation process and show placeholders

## API Integration Guide

### 1. Script Generation

Replace the `generateScript` method with an actual API call:

```javascript
async generateScript(prompt) {
    const response = await fetch('YOUR_AI_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            prompt: `Create a 30-second educational video script about: ${prompt}. Maximum 80 words.`,
            max_tokens: 150
        })
    });
    
    const data = await response.json();
    return data.text;
}
```

### 2. Image Search/Generation

For Unsplash (free images):
```javascript
async generateImages(scenes) {
    const images = [];
    
    for (const scene of scenes) {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${scene.keywords.join(' ')}&per_page=1`,
            {
                headers: {
                    'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY'
                }
            }
        );
        
        const data = await response.json();
        images.push({
            sceneId: scene.id,
            url: data.results[0]?.urls.regular || 'placeholder.jpg',
            alt: scene.keywords.join(' ')
        });
    }
    
    return images;
}
```

### 3. Google Text-to-Speech

```javascript
async generateAudio(script) {
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_GOOGLE_API_KEY'
        },
        body: JSON.stringify({
            input: { text: script },
            voice: {
                languageCode: 'en-US',
                name: this.elements.voice.value
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: parseFloat(this.elements.speechRate.value)
            }
        })
    });
    
    const data = await response.json();
    return {
        duration: 30,
        url: `data:audio/mp3;base64,${data.audioContent}`,
        transcript: script
    };
}
```

### 4. Video Export with FFmpeg.wasm

```javascript
async exportVideo() {
    // Load FFmpeg
    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    
    // Process images and audio into video
    // ... FFmpeg commands here
}
```

## Architecture

The app follows a modular architecture:

- **VideoCreator Class**: Main application controller
- **Generation Pipeline**: Script → Scenes → Images → Audio → Timeline
- **UI Components**: Input panel, preview panel, timeline, settings
- **Async Operations**: All generation steps are async-ready for API integration

## Customization

### Adding New Voices

Add options to the voice selector:
```html
<option value="es-ES-Neural2-A">Spanish - Female</option>
<option value="fr-FR-Neural2-A">French - Female</option>
```

### Changing Visual Styles

Modify the `imageStyle` options and adjust the image generation prompt accordingly.

### Adjusting Video Length

Change the `30` second limit in the script generation and timeline calculations.

## MCP Server Integration Opportunities

The app can be enhanced with MCP servers:

- **YouTube Transcript**: Import educational content from YouTube
- **Browser MCP**: Scrape educational websites for content
- **N8N Workflows**: Automate video generation pipelines
- **Notion**: Save generated scripts and manage video projects

## Next Steps

1. **API Keys**: Set up accounts for AI, image, and TTS services
2. **Server Backend**: Consider adding a backend for API key security
3. **Video Processing**: Implement actual video compilation
4. **Storage**: Add cloud storage for generated videos
5. **Sharing**: Add social media export options

## License

This project is part of the development hub and follows the hub's licensing terms.