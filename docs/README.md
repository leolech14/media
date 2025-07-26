# Criador de Vídeos IA - Português 🇧🇷

Aplicativo revolucionário que converte descrições em linguagem natural em vídeos educativos de 30 segundos completos com narração, vídeos/GIFs animados e legendas sincronizadas.

## 🎬 Recursos Avançados

### Novo Sistema Completo
- **Geração Inteligente de Roteiro**: IA cria scripts segmentados com timing preciso
- **Narração Profissional**: Google Text-to-Speech com vozes naturais em português
- **Vídeos e GIFs Animados**: Busca automática de mídia relevante para cada cena
- **Legendas Sincronizadas**: Geração automática em formato WebVTT
- **Player Integrado**: Reprodução sincronizada de todos elementos
- **Timeline Interativa**: Visualização em tempo real com controle preciso

### Fluxo de Trabalho Otimizado
1. **Roteiro** → Criação por IA com segmentação inteligente
2. **Áudio** → Narração com análise de duração por trecho
3. **Timing** → Cálculo preciso para sincronização perfeita
4. **Mídia** → Busca contextual de vídeos/GIFs relevantes
5. **Legendas** → Geração automática sincronizada

## 🚀 Como Usar

### Início Rápido (Sem Configuração)
```bash
# Abra o arquivo HTML diretamente
open index.html
```
O modo demonstração funcionará sem APIs configuradas.

### Modo Completo (Com APIs)
```bash
# 1. Inicie o servidor
./start_server.sh

# 2. Abra no navegador
http://localhost:3000
```

## 🔑 Configuração das APIs

### Google Text-to-Speech (Já Configurada!)
```bash
# A chave já está incluída no servidor:
GOOGLE_API_KEY=AIzaSyBdZnKxBiWLUSAGhVsxx-BdW6QCsGa16HA
```

### APIs Opcionais para Recursos Completos

#### OpenAI/Claude (Roteiros Avançados)
```bash
# Adicione ao arquivo .env
AI_API_KEY=sua_chave_aqui
```

#### Pexels (Vídeos de Alta Qualidade)
- Crie conta em https://www.pexels.com/api/
- Obtenha chave gratuita
- Adicione: `PEXELS_API_KEY=sua_chave`

#### Giphy (GIFs Animados)
- Registre em https://developers.giphy.com/
- Crie app e obtenha chave
- Adicione: `GIPHY_API_KEY=sua_chave`

#### Unsplash (Imagens Premium)
- Acesse https://unsplash.com/developers
- Registre aplicativo
- Adicione: `UNSPLASH_ACCESS_KEY=sua_chave`

## 📝 Exemplos de Prompts Poderosos

### Educação Infantil
- "Crie um vídeo sobre o ciclo da água com animações coloridas para crianças de 6 anos"
- "Explique os planetas do sistema solar de forma divertida para educação infantil"

### Ensino Fundamental
- "Faça um vídeo sobre fotossíntese com imagens de plantas e sol para alunos do 5º ano"
- "Ensine frações usando pizzas e bolos como exemplos visuais"

### Conteúdo Geral
- "Crie um vídeo motivacional sobre a importância da leitura com cenas de bibliotecas"
- "Explique os benefícios da meditação com imagens relaxantes da natureza"

### Dicas Profissionais
- "Mostre 3 dicas de economia doméstica com gráficos animados e exemplos práticos"
- "Ensine técnicas de respiração para ansiedade com demonstrações visuais"

## 🎯 Estrutura Otimizada do Vídeo

### Divisão Temporal (30 segundos)
1. **Gancho** (0-3s): Captura atenção imediata
2. **Introdução** (3-8s): Apresenta o tema
3. **Desenvolvimento** (8-25s): 3-4 pontos principais
4. **Conclusão** (25-30s): Call-to-action memorável

### Elementos Visuais
- **Vídeos**: Cenas dinâmicas de 3-5 segundos
- **GIFs**: Animações em loop para conceitos
- **Transições**: Suaves entre cenas
- **Legendas**: Máximo 5 palavras por linha

## 🔧 Configuração Avançada

### Vozes Disponíveis
```javascript
// Português Brasil
'pt-BR-Neural2-A' // Feminina padrão
'pt-BR-Neural2-B' // Masculina formal
'pt-BR-Neural2-C' // Feminina jovem

// Português Portugal
'pt-PT-Neural2-A' // Feminina
'pt-PT-Neural2-B' // Masculina
```

### Velocidade de Fala
- **0.75x**: Conteúdo complexo ou técnico
- **1.0x**: Velocidade normal (padrão)
- **1.25x**: Conteúdo dinâmico ou resumos

### Estilos de Mídia
- **educational**: Infográficos e diagramas
- **animated**: GIFs e animações coloridas
- **realistic**: Vídeos do mundo real
- **minimalist**: Clean e moderno
- **colorful**: Vibrante para crianças

## 🛠️ Arquitetura Técnica

### Frontend (index.html)
```javascript
// Fluxo principal
generateVideo() → 
  generateScript() → 
  generateAudio() → 
  searchMedia() → 
  generateSubtitles() → 
  playVideo()
```

### Backend (server_enhanced.js)
```javascript
// Endpoints disponíveis
POST /api/generate-script      // Roteiro segmentado
POST /api/generate-audio-with-timing  // Áudio com timing
POST /api/search-media         // Busca vídeos/GIFs
POST /api/generate-subtitles   // Legendas WebVTT
GET  /api/health              // Status das APIs
```

## 📁 Estrutura do Projeto

```
PROJECT_text-to-video/
├── index.html              # Interface principal (português)
├── server_enhanced.js      # Servidor com todas APIs
├── start_server.sh        # Script de inicialização
├── package.json           # Dependências Node.js
├── .env.example          # Exemplo de configuração
├── README_PT.md          # Esta documentação
└── CLAUDE.md             # Contexto do projeto
```

## 🚀 Roadmap Futuro

### Fase 1: Melhorias Imediatas
- [ ] Cache de áudios gerados
- [ ] Pré-visualização em tempo real
- [ ] Templates de vídeo prontos

### Fase 2: Recursos Pro
- [ ] Editor de timeline drag-and-drop
- [ ] Múltiplas línguas simultâneas
- [ ] Exportação em MP4 real
- [ ] Biblioteca de efeitos sonoros

### Fase 3: Integração Social
- [ ] Upload direto para YouTube/TikTok
- [ ] Agendamento de publicações
- [ ] Analytics de engajamento
- [ ] Colaboração em equipe

## 💡 Dicas de Produção

### Para Melhor Qualidade
1. **Seja Específico**: "para crianças de 8 anos" vs "para crianças"
2. **Defina o Tom**: "divertido e colorido" vs apenas "educativo"
3. **Mencione Visuais**: "com gráficos animados" para melhor busca
4. **Limite Conceitos**: 3-4 pontos principais máximo

### Otimização de Performance
- Use cache do navegador para mídias
- Comprima áudios para carregamento rápido
- Pré-carregue próxima cena durante reprodução
- Limite resolução de vídeos para web

## 🤝 Contribuindo

Este projeto segue as diretrizes do Development Hub:
1. Sempre crie working copies antes de editar
2. Teste completamente antes de promover
3. Mantenha documentação atualizada
4. Use português brasileiro consistente

## 📞 Suporte

- **Issues**: Abra no GitHub do projeto
- **Melhorias**: Pull requests são bem-vindos
- **Dúvidas**: Consulte a documentação primeiro

---

**Criado com ❤️ para educadores e criadores de conteúdo brasileiros**

*Nota: Este é um projeto educacional. Para produção comercial, implemente autenticação robusta, limites de taxa e termos de uso apropriados.*