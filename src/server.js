// Servidor Backend Aprimorado para o Criador de Vídeos IA
// Com suporte a vídeos, análise de áudio e legendas

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { scriptCache, mediaCache, audioCache } = require('./utils/cache');
const { generateCacheKey, shouldCompress } = require('./utils/performance');

// Importar OpenAI SDK v4
const OpenAI = require('openai');

// Importar logging e monitoring
const { logger, logExternalApiCall, logExternalApiResponse, logError } = require('./utils/logger');
const { requestTimer, performanceMonitor, metricsCollector, healthMetrics } = require('./middleware/monitoring');

// Importar middleware de validação
const { validateGenerateScript, validateGenerateAudio, validateSearchMedia, validateGenerateSubtitles } = require('./middleware/validation');

// Importar middleware de rate limiting
const { generalLimiter, aiGenerationLimiter, mediaSearchLimiter, audioGenerationLimiter, healthCheckLimiter } = require('./middleware/rateLimiter');

// Importar middleware de error handling
const { ApiError, asyncHandler, errorHandler, notFoundHandler, timeoutHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://social-ai.pro',
            'https://www.social-ai.pro'
        ];
        
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Compression
app.use(compression({
    filter: shouldCompress,
    level: 6
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Timeout handler (must be applied before other middleware)
app.use(timeoutHandler(30000)); // 30 second timeout

// Monitoring middleware
app.use(requestTimer);
app.use(performanceMonitor);
app.use(metricsCollector);

// Rate limiting middleware para todas as rotas da API
app.use('/api/', generalLimiter);

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Configurações das APIs
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCGgu4SF6RjAXB8WCSNy8UGTBsgHx7d4Kw';

// Inicializar cliente OpenAI
let openai;
if (OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: OPENAI_API_KEY
    });
}

// Configurações de APIs de mídia
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * @swagger
 * /api/generate-script:
 *   post:
 *     summary: Gera um roteiro de vídeo usando IA
 *     tags: [Script Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Descrição do vídeo desejado
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Crie um vídeo sobre os benefícios da meditação"
 *     responses:
 *       200:
 *         description: Roteiro gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 scriptData:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                       example: "Os Benefícios da Meditação"
 *                     segmentos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ScriptSegment'
 *                     palavras_totais:
 *                       type: integer
 *                       example: 75
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       503:
 *         description: Serviço indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Endpoint aprimorado para gerar script com marcações de tempo
app.post('/api/generate-script', aiGenerationLimiter, validateGenerateScript, asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    
    // Check cache first
    const cacheKey = generateCacheKey('script', { prompt: req.body.prompt });
    const cachedScript = scriptCache.get(cacheKey);
    if (cachedScript) {
        logger.info('Script cache hit', { cacheKey });
        return res.json(cachedScript);
    }
    
    if (!openai) {
        throw new ApiError(503, 'OpenAI API key não configurada');
    }

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

        logExternalApiCall('OpenAI', 'chat.completions.create', { model: 'gpt-3.5-turbo' });
        const startTime = Date.now();
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Crie um roteiro de vídeo educativo sobre: ${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        
        const duration = Date.now() - startTime;
        logExternalApiResponse('OpenAI', 'chat.completions.create', 200, duration);

        const scriptData = JSON.parse(response.choices[0].message.content);
        
        const responseData = { 
            success: true, 
            scriptData
        };
        
        // Cache the result
        scriptCache.set(cacheKey, responseData);
        
        res.json(responseData);
}));

/**
 * @swagger
 * /api/generate-audio-with-timing:
 *   post:
 *     summary: Gera áudio sincronizado com marcações de tempo
 *     tags: [Audio Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - segmentos
 *             properties:
 *               segmentos:
 *                 type: array
 *                 description: Lista de segmentos do roteiro
 *                 items:
 *                   $ref: '#/components/schemas/ScriptSegment'
 *               voice:
 *                 type: string
 *                 description: Voz do Google Text-to-Speech
 *                 default: pt-BR-Wavenet-A
 *                 example: pt-BR-Wavenet-A
 *               speakingRate:
 *                 type: number
 *                 description: Velocidade de fala (0.25 a 4.0)
 *                 minimum: 0.25
 *                 maximum: 4.0
 *                 default: 1.0
 *                 example: 1.0
 *     responses:
 *       200:
 *         description: Áudio gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 audioCompleto:
 *                   type: string
 *                   description: Áudio completo em base64
 *                 segmentos:
 *                   type: array
 *                   description: Segmentos de áudio com timing
 *                   items:
 *                     $ref: '#/components/schemas/AudioSegment'
 *                 duracaoTotal:
 *                   type: number
 *                   description: Duração total em segundos
 *                   example: 30.5
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       503:
 *         description: Serviço indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Endpoint aprimorado para gerar áudio com marcações de tempo
app.post('/api/generate-audio-with-timing', audioGenerationLimiter, validateGenerateAudio, asyncHandler(async (req, res) => {
    const { segmentos, voice = 'pt-BR-Wavenet-A', speakingRate = 1.0 } = req.body;
        
        const audioSegments = [];
        let currentTime = 0;
        
        // Gera áudio para cada segmento
        for (const segmento of segmentos) {
            let audioBase64;
            
            // Check audio cache for this segment
            const segmentKey = generateCacheKey('audio', { 
                text: segmento.texto, 
                voice: voice,
                rate: speakingRate 
            });
            const cachedAudio = audioCache.get(segmentKey);
            
            if (cachedAudio) {
                logger.info('Audio cache hit', { segmentKey });
                audioBase64 = cachedAudio;
            } else {
                try {
                // Usar API REST do Google Text-to-Speech
                logExternalApiCall('Google TTS', 'text:synthesize', { voice, speakingRate });
                const startTime = Date.now();
                
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
                
                const duration = Date.now() - startTime;
                logExternalApiResponse('Google TTS', 'text:synthesize', response.status, duration);
                
                audioBase64 = response.data.audioContent;
                
                // Cache the generated audio
                audioCache.set(segmentKey, audioBase64);
                
                logger.info('Áudio gerado com sucesso para segmento');
                } catch (googleError) {
                    logError(googleError, req, 'Google TTS API error');
                    logger.error('Erro com Google TTS:', googleError.response?.data || googleError.message);
                    // Gerar um áudio placeholder silencioso
                    audioBase64 = 'SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uSwAAAAAABLBQAAAMQA13NgAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
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
}));

/**
 * @swagger
 * /api/search-media:
 *   get:
 *     summary: Busca vídeos, GIFs ou imagens relevantes
 *     tags: [Media Search]
 *     parameters:
 *       - in: query
 *         name: keywords
 *         required: true
 *         schema:
 *           type: string
 *         description: Palavras-chave para busca (separadas por vírgula)
 *         example: "educação,aprendizado,estudos"
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [video, gif, imagem]
 *           default: video
 *         description: Tipo de mídia desejada
 *       - in: query
 *         name: duracao
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 60
 *         description: Duração desejada em segundos (para vídeos)
 *         example: 5
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Número de resultados desejados
 *     responses:
 *       200:
 *         description: Mídia encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 media:
 *                   type: array
 *                   description: Lista de mídias encontradas
 *                   items:
 *                     $ref: '#/components/schemas/MediaItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       503:
 *         description: Serviço indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Endpoint para buscar vídeos/GIFs relevantes
app.get('/api/search-media', mediaSearchLimiter, validateSearchMedia, asyncHandler(async (req, res) => {
    const { keywords, tipo = 'video', duracao, count = 3 } = req.query;
    
    // Check cache first
    const cacheKey = generateCacheKey('media', req.query);
    const cachedResults = mediaCache.get(cacheKey);
    if (cachedResults) {
        logger.info('Media cache hit', { cacheKey });
        res.set('Cache-Control', 'public, max-age=3600');
        return res.json(cachedResults);
    }
        
        let media = [];
        
        // Parse keywords if it's a string (for GET requests)
        const keywordsArray = Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',') : []);
        
        // Melhorar keywords para busca
        const searchQuery = keywordsArray.join(' ');
        const educationalTerms = ['educational', 'learning', 'teaching', 'explanation', 'tutorial'];
        const enhancedQuery = `${searchQuery} ${educationalTerms[Math.floor(Math.random() * educationalTerms.length)]}`;
        
        // Busca no Pexels (vídeos)
        if (tipo === 'video' && PEXELS_API_KEY) {
            try {
                // Tentar primeiro com query específica
                logExternalApiCall('Pexels', 'videos/search', { query: searchQuery });
                const startTime = Date.now();
                
                let pexelsResponse = await axios.get('https://api.pexels.com/videos/search', {
                    params: {
                        query: searchQuery,
                        per_page: count * 2, // Buscar mais para ter opções
                        orientation: 'portrait',
                        size: 'medium',
                        locale: 'pt-BR'
                    },
                    headers: {
                        'Authorization': PEXELS_API_KEY
                    }
                });
                
                const duration = Date.now() - startTime;
                logExternalApiResponse('Pexels', 'videos/search', pexelsResponse.status, duration);
                
                // Se não encontrar resultados, tentar com termos mais genéricos
                if (!pexelsResponse.data.videos || pexelsResponse.data.videos.length === 0) {
                    const fallbackQuery = keywordsArray[0] || 'education';
                    logExternalApiCall('Pexels', 'videos/search-fallback', { query: fallbackQuery });
                    const fallbackStartTime = Date.now();
                    
                    pexelsResponse = await axios.get('https://api.pexels.com/videos/search', {
                        params: {
                            query: fallbackQuery,
                            per_page: count,
                            orientation: 'portrait'
                        },
                        headers: {
                            'Authorization': PEXELS_API_KEY
                        }
                    });
                    
                    const fallbackDuration = Date.now() - fallbackStartTime;
                    logExternalApiResponse('Pexels', 'videos/search-fallback', pexelsResponse.status, fallbackDuration);
                }
                
                // Filtrar e ordenar vídeos por relevância e qualidade
                const videos = pexelsResponse.data.videos
                    .filter(video => {
                        // Filtrar vídeos muito longos ou muito curtos
                        return video.duration >= 3 && video.duration <= 30;
                    })
                    .sort((a, b) => {
                        // Priorizar vídeos com duração próxima à desejada
                        const aDiff = Math.abs(a.duration - (duracao || 5));
                        const bDiff = Math.abs(b.duration - (duracao || 5));
                        return aDiff - bDiff;
                    })
                    .slice(0, count);
                
                media = videos.map(video => {
                    // Selecionar melhor qualidade disponível
                    const videoFile = video.video_files
                        .filter(file => file.quality === 'hd' || file.quality === 'sd')
                        .sort((a, b) => {
                            // Priorizar HD mas não muito pesado
                            if (a.quality === 'hd' && a.width <= 1280) return -1;
                            if (b.quality === 'hd' && b.width <= 1280) return 1;
                            return 0;
                        })[0] || video.video_files[0];
                    
                    return {
                        tipo: 'video',
                        url: videoFile.link,
                        preview: video.image,
                        duracao: video.duration,
                        largura: videoFile.width,
                        altura: videoFile.height,
                        qualidade: videoFile.quality,
                        fonte: 'pexels'
                    };
                });
            } catch (err) {
                logError(err, req, 'Pexels API error');
                logger.error('Erro ao buscar no Pexels:', err.message);
            }
        }
        
        // Busca no Giphy (GIFs animados)
        if (tipo === 'gif' && GIPHY_API_KEY) {
            try {
                // Adicionar termos educacionais para melhor relevância
                const educationalGifQuery = `${searchQuery} educational animated`;
                
                logExternalApiCall('Giphy', 'gifs/search', { query: educationalGifQuery });
                const startTime = Date.now();
                
                const giphyResponse = await axios.get('https://api.giphy.com/v1/gifs/search', {
                    params: {
                        api_key: GIPHY_API_KEY,
                        q: educationalGifQuery,
                        limit: count * 2,
                        rating: 'g',
                        lang: 'pt'
                    }
                });
                
                const duration = Date.now() - startTime;
                logExternalApiResponse('Giphy', 'gifs/search', giphyResponse.status, duration);
                
                // Filtrar GIFs mais relevantes
                const gifs = giphyResponse.data.data
                    .filter(gif => {
                        // Filtrar por aspecto ratio adequado para mobile
                        const width = parseInt(gif.images.original.width);
                        const height = parseInt(gif.images.original.height);
                        const aspectRatio = height / width;
                        return aspectRatio >= 1.3 && aspectRatio <= 2.0;
                    })
                    .slice(0, count);
                
                media = gifs.map(gif => ({
                    tipo: 'gif',
                    url: gif.images.original.mp4 || gif.images.looping.mp4,
                    preview: gif.images.preview_gif.url,
                    largura: gif.images.original.width,
                    altura: gif.images.original.height,
                    titulo: gif.title,
                    fonte: 'giphy'
                }));
            } catch (err) {
                logError(err, req, 'Giphy API error');
                logger.error('Erro ao buscar no Giphy:', err.message);
            }
        }
        
        // Fallback para Unsplash (imagens estáticas)
        if (media.length === 0 && UNSPLASH_ACCESS_KEY) {
            try {
                // Melhorar query para imagens educacionais
                const educationalImageQuery = `${searchQuery} educational concept illustration`;
                
                logExternalApiCall('Unsplash', 'search/photos', { query: educationalImageQuery });
                const startTime = Date.now();
                
                const unsplashResponse = await axios.get('https://api.unsplash.com/search/photos', {
                    params: {
                        query: educationalImageQuery,
                        per_page: count * 2,
                        orientation: 'portrait',
                        content_filter: 'high', // Conteúdo seguro
                        order_by: 'relevant'
                    },
                    headers: {
                        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                });
                
                const duration = Date.now() - startTime;
                logExternalApiResponse('Unsplash', 'search/photos', unsplashResponse.status, duration);
                
                // Se não encontrar, tentar com query mais simples
                let photos = unsplashResponse.data.results;
                if (photos.length === 0) {
                    const fallbackQuery = keywordsArray[0] || 'education';
                    logExternalApiCall('Unsplash', 'search/photos-fallback', { query: fallbackQuery });
                    const fallbackStartTime = Date.now();
                    
                    const fallbackResponse = await axios.get('https://api.unsplash.com/search/photos', {
                        params: {
                            query: fallbackQuery,
                            per_page: count,
                            orientation: 'portrait'
                        },
                        headers: {
                            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                        }
                    });
                    
                    const fallbackDuration = Date.now() - fallbackStartTime;
                    logExternalApiResponse('Unsplash', 'search/photos-fallback', fallbackResponse.status, fallbackDuration);
                    photos = fallbackResponse.data.results;
                }
                
                media = photos
                    .filter(img => {
                        // Filtrar imagens com proporção adequada
                        const aspectRatio = img.height / img.width;
                        return aspectRatio >= 1.3;
                    })
                    .slice(0, count)
                    .map(img => ({
                        tipo: 'imagem',
                        url: img.urls.regular,
                        preview: img.urls.thumb,
                        largura: img.width,
                        altura: img.height,
                        descricao: img.description || img.alt_description,
                        autor: img.user.name,
                        fonte: 'unsplash'
                    }));
            } catch (err) {
                logError(err, req, 'Unsplash API error');
                logger.error('Erro ao buscar no Unsplash:', err.message);
            }
        }
        
        const responseData = { 
            success: true, 
            media
        };
        
        // Cache successful results
        mediaCache.set(cacheKey, responseData);
        
        // Set cache headers for client-side caching
        res.set('Cache-Control', 'public, max-age=3600');
        
        res.json(responseData);
}));

/**
 * @swagger
 * /api/generate-subtitles:
 *   post:
 *     summary: Gera legendas sincronizadas com timing
 *     tags: [Subtitles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - segmentos
 *             properties:
 *               segmentos:
 *                 type: array
 *                 description: Segmentos de áudio com timing
 *                 items:
 *                   $ref: '#/components/schemas/AudioSegment'
 *     responses:
 *       200:
 *         description: Legendas geradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 legendas:
 *                   type: array
 *                   description: Lista de legendas com timing
 *                   items:
 *                     $ref: '#/components/schemas/Subtitle'
 *                 vtt:
 *                   type: string
 *                   description: Conteúdo do arquivo WebVTT
 *                   example: "WEBVTT\n\n1\n00:00:00.000 --> 00:00:02.500\nPrimeira linha da legenda\n\n"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Endpoint para gerar legendas sincronizadas
app.post('/api/generate-subtitles', validateGenerateSubtitles, asyncHandler(async (req, res) => {
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
}));

// Função auxiliar para combinar segmentos de áudio
async function combineAudioSegments(segments) {
    // Implementação simplificada - em produção use ffmpeg
    // Por enquanto, retorna o primeiro segmento ou combina todos
    if (segments.length === 0) return '';
    
    // Se houver apenas um segmento, retorna ele
    if (segments.length === 1) return segments[0].audio;
    
    // Para múltiplos segmentos, por enquanto retorna o primeiro
    // Em produção, usaria ffmpeg para concatenar os áudios
    logger.info(`Combinando ${segments.length} segmentos de áudio`);
    
    // Retorna o áudio completo do primeiro segmento como teste
    return segments[0].audio;
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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica o status da API e serviços externos
 *     tags: [Health Check]
 *     responses:
 *       200:
 *         description: Status da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 apis:
 *                   type: object
 *                   description: Status das APIs externas
 *                   properties:
 *                     openai:
 *                       type: boolean
 *                       description: OpenAI API configurada
 *                     google:
 *                       type: boolean
 *                       description: Google TTS API configurada
 *                     unsplash:
 *                       type: boolean
 *                       description: Unsplash API configurada
 *                     pexels:
 *                       type: boolean
 *                       description: Pexels API configurada
 *                     giphy:
 *                       type: boolean
 *                       description: Giphy API configurada
 *                 metrics:
 *                   type: object
 *                   description: Métricas de performance
 */
// Endpoint de health check aprimorado
app.get('/api/health', healthCheckLimiter, (req, res) => {
    const apiStatus = {
        openai: !!OPENAI_API_KEY,
        google: !!GOOGLE_API_KEY,
        unsplash: !!UNSPLASH_ACCESS_KEY,
        pexels: !!PEXELS_API_KEY,
        giphy: !!GIPHY_API_KEY
    };
    
    // Set no-cache headers for health endpoint
    res.set('Cache-Control', 'no-cache');
    
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        apis: apiStatus,
        metrics: healthMetrics.getMetrics(),
        cacheStats: {
            scripts: scriptCache.getStats(),
            media: mediaCache.getStats(),
            audio: audioCache.getStats()
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server only if not in Vercel environment
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        logger.info(`Servidor rodando na porta ${PORT}`);
        logger.info(`Acesse: http://localhost:${PORT}`);
        logger.info('APIs configuradas:', {
            openai: OPENAI_API_KEY ? 'enabled' : 'disabled',
            googleTts: GOOGLE_API_KEY ? 'enabled' : 'disabled',
            unsplash: UNSPLASH_ACCESS_KEY ? 'enabled' : 'disabled',
            pexels: PEXELS_API_KEY ? 'enabled' : 'disabled',
            giphy: GIPHY_API_KEY ? 'enabled' : 'disabled'
        });
    });
}

module.exports = app;