#!/bin/bash

echo "🚀 Iniciando Servidor do Criador de Vídeos IA"
echo ""

# Verificar se há servidor rodando e matar
echo "🧹 Limpando processos antigos..."
pkill -f "node server" 2>/dev/null
sleep 1

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "✅ Iniciando servidor..."
echo "📍 Acesse: http://localhost:3000"
echo ""

# Usar servidor básico que funciona
doppler run --project notion-integration --config dev -- node server.js