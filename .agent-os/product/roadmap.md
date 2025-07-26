# Product Roadmap

## Phase 1: MVP (Completed) ✅
- Natural language input interface
- OpenAI script generation (30-second limit)
- Google TTS integration with premium voices
- Basic media search (Pexels, Giphy, Unsplash)
- Timeline visualization
- Video preview with playback
- WebM export functionality

## Phase 2: Enhanced Media (Current) 🚧
- ✅ Improved media search algorithms
- ✅ Educational content prioritization
- ✅ Quality filtering and relevance scoring
- ⏳ AI-powered media selection
- ⏳ Custom media upload support

## Phase 3: Production Features (Next)
- MP4 export with ffmpeg.wasm
- Video templates and themes
- Background music library
- Advanced subtitle styling
- Batch video generation
- Project save/load functionality

## Phase 4: Platform Integration
- YouTube direct upload
- TikTok/Instagram formatting
- Social media scheduling
- Analytics dashboard
- User accounts and storage
- Collaboration features

## Phase 5: AI Enhancement
- GPT-4 for better scripts
- DALL-E image generation
- Voice cloning options
- Multi-language support
- Auto-translation features
- Content moderation

## Technical Debt
- Implement proper audio concatenation
- Add comprehensive error handling
- Create test suite
- Optimize media loading
- Implement caching layer
- Add progress persistence

## Known Issues
- Audio may require manual play (browser autoplay policies)
- WebM format requires conversion for some platforms
- Media API rate limits need monitoring
- Large videos may hit memory constraints