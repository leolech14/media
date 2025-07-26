#!/bin/bash

echo "🎬 Configurando Criador de Vídeos IA em Português..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js primeiro.${NC}"
    echo "   Visite: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

# Instala dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Verifica Doppler
if ! command -v doppler &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  Doppler CLI não encontrado.${NC}"
    echo "   Para instalar: curl -Ls https://cli.doppler.com/install.sh | sh"
    echo ""
    read -p "Deseja instalar o Doppler agora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        curl -Ls https://cli.doppler.com/install.sh | sh
    fi
fi

# Cria arquivo .env de exemplo
echo ""
echo "📝 Criando arquivo .env.example..."
cat > .env.example << EOL
# APIs de IA (escolha uma)
OPENAI_API_KEY=sk-...
AI_API_KEY=...

# Google Cloud Text-to-Speech
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/credentials.json
# Ou use uma chave de API:
# GOOGLE_TTS_API_KEY=...

# Unsplash para imagens
UNSPLASH_ACCESS_KEY=...

# Servidor
PORT=3000
EOL

echo -e "${GREEN}✅ Arquivo .env.example criado${NC}"

# Instruções finais
echo ""
echo "🚀 Próximos passos:"
echo ""
echo "1. Configure as APIs:"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Google Cloud: https://console.cloud.google.com/"
echo "   - Unsplash: https://unsplash.com/developers"
echo ""
echo "2. Configure o Doppler (recomendado):"
echo "   doppler login"
echo "   doppler setup"
echo "   doppler secrets set OPENAI_API_KEY \"sua-chave\""
echo "   doppler secrets set UNSPLASH_ACCESS_KEY \"sua-chave\""
echo ""
echo "3. Ou crie um arquivo .env local:"
echo "   cp .env.example .env"
echo "   # Edite .env com suas chaves"
echo ""
echo "4. Inicie o servidor:"
echo "   Com Doppler: doppler run -- npm start"
echo "   Com .env: npm start"
echo ""
echo "5. Abra o aplicativo:"
echo "   http://localhost:3000"
echo ""
echo -e "${GREEN}✨ Configuração concluída!${NC}"