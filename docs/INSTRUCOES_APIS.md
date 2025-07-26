# 🔑 Instruções para Configurar as APIs

Este guia explica como obter as chaves de API necessárias para o Criador de Vídeos IA funcionar completamente.

## 1. OpenAI API (Geração de Scripts)

### Criar conta e obter chave:
1. Acesse: https://platform.openai.com/signup
2. Crie uma conta ou faça login
3. Vá para: https://platform.openai.com/api-keys
4. Clique em "Create new secret key"
5. Copie a chave (começa com `sk-`)
6. Adicione ao Doppler:
   ```bash
   doppler secrets set OPENAI_API_KEY "sk-sua-chave-aqui"
   ```

### Custos:
- Modelo GPT-3.5-turbo: ~$0.002 por script gerado
- Créditos gratuitos para novas contas: $5

## 2. Google Cloud Text-to-Speech (Narração)

### Configurar Google Cloud:
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Ative a API Text-to-Speech:
   - Menu → APIs e Serviços → Biblioteca
   - Pesquise "Cloud Text-to-Speech API"
   - Clique em "ATIVAR"

### Criar credenciais:
1. Menu → APIs e Serviços → Credenciais
2. Clique em "CRIAR CREDENCIAIS" → "Chave de conta de serviço"
3. Preencha:
   - Nome: text-to-speech-key
   - Função: Básico → Editor
4. Clique em "CONCLUIR"
5. Clique na conta criada → Aba "CHAVES" → "ADICIONAR CHAVE" → "Criar nova chave"
6. Escolha JSON → "CRIAR"
7. Salve o arquivo JSON baixado em local seguro
8. Configure no Doppler:
   ```bash
   # Opção 1: Caminho do arquivo
   doppler secrets set GOOGLE_APPLICATION_CREDENTIALS "/caminho/para/credentials.json"
   
   # Opção 2: Conteúdo do arquivo (mais seguro)
   doppler secrets set GOOGLE_CREDENTIALS_JSON "$(cat credentials.json)"
   ```

### Custos:
- Primeiras 1 milhão de caracteres/mês: Gratuito
- Depois: $4 por milhão de caracteres
- Vozes Neural2 (alta qualidade): $16 por milhão

## 3. Unsplash API (Imagens Gratuitas)

### Criar aplicação:
1. Acesse: https://unsplash.com/join
2. Crie uma conta gratuita
3. Vá para: https://unsplash.com/oauth/applications
4. Clique em "New Application"
5. Aceite os termos e preencha:
   - Nome: Criador de Vídeos IA
   - Descrição: App para criar vídeos educativos
6. Copie o "Access Key"
7. Adicione ao Doppler:
   ```bash
   doppler secrets set UNSPLASH_ACCESS_KEY "sua-chave-access"
   ```

### Limites:
- Demo (gratuito): 50 requisições/hora
- Production: 5000 requisições/hora (requer aprovação)

## 4. Configurar Doppler

### Instalar Doppler CLI:
```bash
# macOS/Linux
curl -Ls https://cli.doppler.com/install.sh | sh

# Verificar instalação
doppler --version
```

### Configurar projeto:
```bash
# Fazer login
doppler login

# Navegar até o projeto
cd /Users/lech/development_hub/PROJECT_text-to-video

# Configurar projeto
doppler setup

# Escolher:
# - project: video-creator-ai (ou criar novo)
# - config: dev
```

### Adicionar todas as secrets:
```bash
# OpenAI
doppler secrets set OPENAI_API_KEY "sk-..."

# Google Cloud (escolha uma opção)
doppler secrets set GOOGLE_APPLICATION_CREDENTIALS "/path/to/file.json"
# OU
doppler secrets set GOOGLE_TTS_API_KEY "AIza..."

# Unsplash
doppler secrets set UNSPLASH_ACCESS_KEY "..."

# Verificar
doppler secrets
```

## 5. Testar Configuração

### Instalar dependências:
```bash
npm install
```

### Iniciar servidor com Doppler:
```bash
doppler run -- npm start
```

### Verificar APIs:
Acesse: http://localhost:3000/api/health

Você deve ver:
```json
{
  "status": "ok",
  "apis": {
    "openai": true,
    "google": true,
    "unsplash": true
  }
}
```

## 🎯 Dicas

### Economizar nos custos:
1. Use cache para scripts e áudios repetidos
2. Configure limites de requisições
3. Use imagens do Unsplash (gratuitas) ao invés de gerar
4. Monitore uso no dashboard de cada serviço

### Segurança:
1. NUNCA commite arquivos com chaves
2. Use Doppler para todos os ambientes
3. Configure billing alerts em cada serviço
4. Rotacione chaves periodicamente

### Problemas comuns:

**"API key not valid"**
- Verifique se copiou a chave completa
- Confirme que a API está ativada
- Verifique limites de cota

**"Permission denied"** 
- Google Cloud: Verifique permissões da conta de serviço
- Adicione a role "Cloud Text-to-Speech User"

**"Rate limit exceeded"**
- Implemente retry com backoff
- Use cache agressivamente
- Considere upgrade do plano

## 📞 Suporte

- OpenAI: https://help.openai.com/
- Google Cloud: https://cloud.google.com/support
- Unsplash: https://help.unsplash.com/
- Doppler: https://docs.doppler.com/