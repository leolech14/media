#!/bin/bash

# Script para iniciar o servidor com credenciais do Doppler

echo "🚀 Iniciando Servidor do Criador de Vídeos IA com Doppler..."

# Verificar se o Doppler está instalado
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler não está instalado. Instalando..."
    curl -Ls https://cli.doppler.com/install.sh | sh
fi

# Verificar se está logado no Doppler
if ! doppler whoami &> /dev/null; then
    echo "🔐 Por favor, faça login no Doppler:"
    doppler login
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale primeiro."
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Usar o projeto notion-integration que já está configurado
doppler setup --project notion-integration --config dev --no-interactive

# Mostrar quais secrets estão disponíveis
echo "📋 Secrets disponíveis no Doppler:"
doppler secrets --only-names

echo ""
echo "✅ Iniciando servidor com credenciais do Doppler..."
echo "📍 O servidor estará disponível em: http://localhost:3000"
echo ""

# Iniciar o servidor com as variáveis do Doppler
doppler run -- node server_enhanced.js