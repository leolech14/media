# AI Video Creator - Text to Video Platform

🎬 Transform natural language descriptions into engaging 30-second educational videos with AI-powered script generation, premium voice narration, and intelligent media selection.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

- 🤖 **AI Script Generation** - OpenAI GPT-3.5 creates educational scripts
- 🎙️ **Premium Voices** - Google WaveNet & Neural2 voices in Portuguese
- 🎥 **Smart Media Search** - Educational content from Pexels, Giphy, Unsplash
- 📱 **Mobile Optimized** - 9:16 aspect ratio for social media
- ⏱️ **30-Second Format** - Perfect for TikTok, Reels, Shorts
- 🎬 **Timeline Editor** - Visual scene management
- 📥 **Video Export** - Download as WebM/MP4 with audio and subtitles

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/media.git
cd media

# Install dependencies
npm install

# Configure environment
cp config/.env.example .env
# Add your API keys to .env

# Start server
npm start
```

Open http://localhost:3000 and start creating!

## 📋 Requirements

- Node.js 18+
- API Keys:
  - OpenAI API
  - Google Cloud Text-to-Speech
  - Pexels
  - Giphy  
  - Unsplash

## 🎯 Usage

1. Enter a video description in Portuguese
2. Select voice and speech settings
3. Click "Gerar Vídeo" to create
4. Preview with synchronized playback
5. Export as video file

## 🏗️ Architecture

```
PROJECT_media/
├── src/
│   ├── index.html    # Frontend application
│   └── server.js     # Express backend
├── docs/             # Documentation
├── config/           # Configuration files
├── scripts/          # Utility scripts
└── archive/          # Previous versions
```

## 🔧 Configuration

See [docs/quick-start.md](docs/quick-start.md) for detailed setup instructions.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Google Cloud Text-to-Speech for premium voices
- OpenAI for script generation
- Pexels, Giphy, Unsplash for media content

---

Made with ❤️ for educators and content creators