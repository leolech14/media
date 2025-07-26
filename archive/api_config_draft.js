// Configuração da API para o Criador de Vídeos em Português
// Este arquivo deve ser usado com Doppler para gerenciar secrets de forma segura

class APIConfig {
    constructor() {
        // Em produção, estas chaves virão do Doppler
        // Use: doppler run -- node seu_servidor.js
        this.config = {
            // OpenAI ou Claude para geração de scripts
            aiAPI: {
                endpoint: process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/completions',
                key: process.env.AI_API_KEY || 'sua-chave-aqui',
                model: process.env.AI_MODEL || 'gpt-3.5-turbo'
            },
            
            // Google Cloud Text-to-Speech para narração em português
            googleTTS: {
                endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
                key: process.env.GOOGLE_TTS_API_KEY || 'sua-chave-google-aqui',
                defaultVoice: 'pt-BR-Neural2-A' // Voz feminina brasileira
            },
            
            // Unsplash para imagens educacionais gratuitas
            unsplash: {
                endpoint: 'https://api.unsplash.com/search/photos',
                key: process.env.UNSPLASH_ACCESS_KEY || 'sua-chave-unsplash-aqui'
            },
            
            // Configurações específicas para português
            language: {
                code: 'pt-BR',
                wordsPerSecond: 2.5, // Velocidade média de fala em português
                maxWords: 80, // Para vídeos de 30 segundos
                commonWords: ['o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'mas', 'em', 'de', 'para', 'com', 'por']
            }
        };
    }

    // Método para gerar script em português
    async generatePortugueseScript(prompt) {
        const systemPrompt = `Você é um especialista em criar roteiros educativos curtos em português brasileiro.
        Crie um roteiro de exatamente 30 segundos (75-80 palavras) sobre o tema solicitado.
        O roteiro deve ser educativo, claro e adequado para redes sociais.
        Estrutura: Introdução cativante, 2-3 pontos principais, conclusão memorável.`;

        const response = await fetch(this.config.aiAPI.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.aiAPI.key}`
            },
            body: JSON.stringify({
                model: this.config.aiAPI.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Crie um roteiro de 30 segundos sobre: ${prompt}` }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Método para gerar áudio em português
    async generatePortugueseAudio(text, voice = 'pt-BR-Neural2-A', speed = 1.0) {
        const response = await fetch(this.config.googleTTS.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.googleTTS.key}`
            },
            body: JSON.stringify({
                input: { text },
                voice: {
                    languageCode: 'pt-BR',
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speed,
                    pitch: 0
                }
            })
        });

        const data = await response.json();
        return data.audioContent; // Base64 encoded audio
    }

    // Método para buscar imagens educacionais
    async searchEducationalImages(keywords, style = 'educational') {
        // Traduz estilo para inglês para melhor resultado no Unsplash
        const styleMap = {
            'educacional': 'educational',
            'animado': 'animated cartoon',
            'realista': 'realistic photo',
            'minimalista': 'minimalist design',
            'colorido': 'colorful vibrant'
        };

        const query = `${keywords.join(' ')} ${styleMap[style] || style}`;
        
        const response = await fetch(
            `${this.config.unsplash.endpoint}?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
            {
                headers: {
                    'Authorization': `Client-ID ${this.config.unsplash.key}`
                }
            }
        );

        const data = await response.json();
        return data.results.map(img => ({
            url: img.urls.regular,
            thumbnail: img.urls.thumb,
            author: img.user.name,
            description: img.description || img.alt_description
        }));
    }
}

// Exemplo de uso com Doppler
// 1. Configure as variáveis no Doppler:
//    doppler secrets set AI_API_KEY "sua-chave-openai"
//    doppler secrets set GOOGLE_TTS_API_KEY "sua-chave-google"
//    doppler secrets set UNSPLASH_ACCESS_KEY "sua-chave-unsplash"
//
// 2. Execute com Doppler:
//    doppler run -- node server.js
//
// 3. Ou baixe as variáveis:
//    doppler secrets download --no-file --format env > .env

// Export para uso no navegador ou Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
} else {
    window.APIConfig = APIConfig;
}