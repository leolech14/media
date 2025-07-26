// Servidor Backend Aprimorado para o Criador de Vídeos IA
// Com suporte a vídeos, análise de áudio e legendas

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Configuração das APIs
const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY
});
const openai = new OpenAIApi(openaiConfig);

// Cliente Google Text-to-Speech
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyBdZnKxBiWLUSAGhVsxx-BdW6QCsGa16HA';
const ttsClient = process.env.GOOGLE_APPLICATION_CREDENTIALS 
    ? new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      })
    : null;

// Configurações de APIs de mídia
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Endpoint aprimorado para gerar script com marcações de tempo
app.post('/api/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const systemPrompt = `Você é um especialista em criar roteiros para vídeos educativos de 30 segundos em português brasileiro.
        
        IMPORTANTE: 
        1. Crie um roteiro com EXATAMENTE 30 segundos (75-80 palavras)
        2. Divida o roteiro em segmentos naturais de fala (frases ou ideias completas)
        3. Para cada segmento, indique:
           - O texto exato a ser narrado
           - Palavras-chave visuais (o que mostrar na tela)
           - Duração estimada em segundos (baseado em 2.5 palavras/segundo)
        
        Retorne no formato JSON:
        {
          "titulo": "Título do vídeo",
          "segmentos": [
            {
              "texto": "Texto a ser narrado",
              "palavras_chave": ["palavra1", "palavra2"],
              "duracao_estimada": 3.5,
              "tipo_visual": "video|imagem|animacao"
            }
          ],
          "palavras_totais": 75
        }`;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Crie um roteiro de vídeo educativo sobre: ${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const scriptData = JSON.parse(completion.data.choices[0].message.content);
        
        res.json({ 
            success: true, 
            scriptData
        });

    } catch (error) {
        console.error('Erro ao gerar script:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao gerar script',
            details: error.message 
        });
    }
});

// Endpoint aprimorado para gerar áudio com marcações de tempo
app.post('/api/generate-audio-with-timing', async (req, res) => {
    try {
        const { segmentos, voice = 'pt-BR-Neural2-A', speakingRate = 1.0 } = req.body;
        
        const audioSegments = [];
        let currentTime = 0;
        
        // Gera áudio para cada segmento
        for (const segmento of segmentos) {
            let audioBase64;
            
            if (ttsClient) {
                // Usar cliente SDK do Google Cloud
                const request = {
                    input: { text: segmento.texto },
                    voice: {
                        languageCode: 'pt-BR',
                        name: voice
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: speakingRate,
                        pitch: 0
                    }
                };

                const [response] = await ttsClient.synthesizeSpeech(request);
                audioBase64 = response.audioContent.toString('base64');
            } else {
                // Usar API REST com API Key
                try {
                    const response = await axios.post(
                        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
                        {
                            input: { text: segmento.texto },
                            voice: {
                                languageCode: 'pt-BR',
                                name: voice
                            },
                            audioConfig: {
                                audioEncoding: 'MP3',
                                speakingRate: speakingRate,
                                pitch: 0
                            }
                        }
                    );
                    
                    audioBase64 = response.data.audioContent;
                } catch (googleError) {
                    console.log('Erro com Google TTS, usando áudio placeholder...');
                    // Gerar um áudio placeholder silencioso
                    audioBase64 = 'SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uSwAAAAAABLBQAAAMQA13NgAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                }
            }
            
            // Calcula duração real do áudio (aproximada)
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            // Usar duração estimada baseada no número de palavras se o áudio for placeholder
            const palavras = segmento.texto.split(' ').length;
            const durationEstimate = audioBase64.length < 1000 
                ? (palavras / 2.5) / speakingRate  // 2.5 palavras por segundo
                : (audioBuffer.length / 16000) / speakingRate; // Estimativa para áudio real
            
            audioSegments.push({
                texto: segmento.texto,
                audio: audioBase64,
                inicio: currentTime,
                duracao: durationEstimate,
                fim: currentTime + durationEstimate
            });
            
            currentTime += durationEstimate;
        }
        
        // Combina todos os segmentos em um único áudio
        const fullAudioBase64 = await combineAudioSegments(audioSegments);
        
        res.json({ 
            success: true, 
            audioCompleto: fullAudioBase64,
            segmentos: audioSegments,
            duracaoTotal: currentTime
        });

    } catch (error) {
        console.error('Erro ao gerar áudio:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao gerar áudio',
            details: error.message 
        });
    }
});

// Endpoint para buscar vídeos/GIFs relevantes
app.post('/api/search-media', async (req, res) => {
    try {
        const { keywords, tipo = 'video', duracao, count = 3 } = req.body;
        
        let media = [];
        
        // Busca no Pexels (vídeos)
        if (tipo === 'video' && PEXELS_API_KEY) {
            const pexelsResponse = await axios.get('https://api.pexels.com/videos/search', {
                params: {
                    query: keywords.join(' '),
                    per_page: count,
                    orientation: 'portrait',
                    size: 'medium'
                },
                headers: {
                    'Authorization': PEXELS_API_KEY
                }
            });
            
            media = pexelsResponse.data.videos.map(video => ({
                tipo: 'video',
                url: video.video_files[0].link,
                preview: video.image,
                duracao: video.duration,
                largura: video.width,
                altura: video.height,
                fonte: 'pexels'
            }));
        }
        
        // Busca no Giphy (GIFs animados)
        if (tipo === 'gif' && GIPHY_API_KEY) {
            const giphyResponse = await axios.get('https://api.giphy.com/v1/gifs/search', {
                params: {
                    api_key: GIPHY_API_KEY,
                    q: keywords.join(' '),
                    limit: count,
                    rating: 'g'
                }
            });
            
            media = giphyResponse.data.data.map(gif => ({
                tipo: 'gif',
                url: gif.images.original.mp4,
                preview: gif.images.preview_gif.url,
                largura: gif.images.original.width,
                altura: gif.images.original.height,
                fonte: 'giphy'
            }));
        }
        
        // Fallback para Unsplash (imagens estáticas)
        if (media.length === 0 && UNSPLASH_ACCESS_KEY) {
            const unsplashResponse = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: keywords.join(' '),
                    per_page: count,
                    orientation: 'portrait'
                },
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            });
            
            media = unsplashResponse.data.results.map(img => ({
                tipo: 'imagem',
                url: img.urls.regular,
                preview: img.urls.thumb,
                largura: img.width,
                altura: img.height,
                fonte: 'unsplash'
            }));
        }
        
        res.json({ 
            success: true, 
            media
        });

    } catch (error) {
        console.error('Erro ao buscar mídia:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao buscar mídia',
            details: error.message 
        });
    }
});

// Endpoint para gerar legendas sincronizadas
app.post('/api/generate-subtitles', async (req, res) => {
    try {
        const { segmentos } = req.body;
        
        const legendas = [];
        
        for (const segmento of segmentos) {
            // Divide o texto em partes menores para legendas
            const palavras = segmento.texto.split(' ');
            const palavrasPorLegenda = 5; // 5 palavras por linha de legenda
            
            let tempoAtual = segmento.inicio;
            const duracaoPorPalavra = segmento.duracao / palavras.length;
            
            for (let i = 0; i < palavras.length; i += palavrasPorLegenda) {
                const textoDaLegenda = palavras.slice(i, i + palavrasPorLegenda).join(' ');
                const numeroPalavras = Math.min(palavrasPorLegenda, palavras.length - i);
                const duracaoDaLegenda = duracaoPorPalavra * numeroPalavras;
                
                legendas.push({
                    id: legendas.length + 1,
                    inicio: tempoAtual,
                    fim: tempoAtual + duracaoDaLegenda,
                    texto: textoDaLegenda
                });
                
                tempoAtual += duracaoDaLegenda;
            }
        }
        
        // Gera arquivo WebVTT
        const vttContent = gerarWebVTT(legendas);
        
        res.json({ 
            success: true, 
            legendas,
            vtt: vttContent
        });

    } catch (error) {
        console.error('Erro ao gerar legendas:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao gerar legendas',
            details: error.message 
        });
    }
});

// Função auxiliar para combinar segmentos de áudio
async function combineAudioSegments(segments) {
    // Implementação simplificada - em produção use ffmpeg
    // Por enquanto, retorna o primeiro segmento
    return segments.length > 0 ? segments[0].audio : '';
}

// Função para gerar arquivo WebVTT
function gerarWebVTT(legendas) {
    let vtt = 'WEBVTT\n\n';
    
    for (const legenda of legendas) {
        const inicio = formatarTempo(legenda.inicio);
        const fim = formatarTempo(legenda.fim);
        vtt += `${legenda.id}\n${inicio} --> ${fim}\n${legenda.texto}\n\n`;
    }
    
    return vtt;
}

// Função para formatar tempo em HH:MM:SS.mmm
function formatarTempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = (segundos % 60).toFixed(3);
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(6, '0')}`;
}

// Endpoint de health check aprimorado
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        apis: {
            openai: !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY),
            google: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || GOOGLE_API_KEY),
            unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
            pexels: !!process.env.PEXELS_API_KEY,
            giphy: !!process.env.GIPHY_API_KEY
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
    console.log('\n🔑 APIs configuradas:');
    console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
    console.log(`   Google TTS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅' : '❌'}`);
    console.log(`   Unsplash: ${process.env.UNSPLASH_ACCESS_KEY ? '✅' : '❌'}`);
    console.log(`   Pexels: ${process.env.PEXELS_API_KEY ? '✅' : '❌'}`);
    console.log(`   Giphy: ${process.env.GIPHY_API_KEY ? '✅' : '❌'}`);
});

module.exports = app;