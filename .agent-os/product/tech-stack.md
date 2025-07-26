# Technical Architecture

## Frontend Stack
- **Framework**: Vanilla JavaScript (ES6+)
- **UI**: Custom CSS with dark theme
- **Video**: HTML5 Canvas API + MediaRecorder
- **Audio**: Web Audio API
- **Build**: No build process (direct serve)

## Backend Stack
- **Runtime**: Node.js v24+
- **Framework**: Express.js
- **APIs**: RESTful architecture
- **CORS**: Enabled for local development

## External APIs
- **OpenAI GPT-3.5**: Script generation with structured output
- **Google Cloud Text-to-Speech**: WaveNet voices for narration
- **Pexels**: Educational video content
- **Giphy**: Animated educational GIFs
- **Unsplash**: High-quality educational images

## Key Features
- **Smart Media Search**: Enhanced algorithms for educational content
- **Voice Selection**: 6 premium Google voices (WaveNet + Neural2)
- **Timeline Visualization**: Interactive scene management
- **Export Options**: WebM video with embedded audio/subtitles
- **Real-time Preview**: Scene-by-scene playback with sync

## Architecture Decisions
- **No Build Process**: Simplicity over complexity
- **Server-side API Keys**: Security through backend proxy
- **Canvas Recording**: Native browser APIs for video generation
- **Modular Design**: Clear separation of concerns

## Performance Targets
- Script generation: < 5 seconds
- Audio synthesis: < 10 seconds
- Media search: < 3 seconds per scene
- Video export: < 30 seconds
- Total workflow: < 2 minutes