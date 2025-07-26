# Como Ativar o Google Text-to-Speech

## Passo 1: Acessar o Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google

## Passo 2: Criar ou Selecionar um Projeto
1. No topo da página, clique no seletor de projetos
2. Clique em "Novo Projeto" ou selecione um existente
3. Dê um nome como "text-to-video-app"

## Passo 3: Ativar a API Text-to-Speech
1. Acesse diretamente: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
2. Ou busque por "Text-to-Speech API" na biblioteca de APIs
3. Clique no botão "ATIVAR"
4. Aguarde alguns segundos para ativação

## Passo 4: Verificar Faturamento (Importante!)
1. O Google Cloud requer uma conta de faturamento ativa
2. Você tem $300 de créditos grátis ao criar uma conta
3. Text-to-Speech oferece 1 milhão de caracteres grátis por mês
4. Se necessário, configure o faturamento em: https://console.cloud.google.com/billing

## Passo 5: Criar Credenciais (Opcional)
Sua chave API atual deve funcionar após ativar a API:
```
AIzaSyBdZnKxBiWLUSAGhVsxx-BdW6QCsGa16HA
```

Se precisar criar uma nova:
1. Vá para: https://console.cloud.google.com/apis/credentials
2. Clique em "CRIAR CREDENCIAIS" → "Chave de API"
3. Copie a nova chave
4. Atualize no Doppler: `doppler secrets set GOOGLE_API_KEY "nova_chave"`

## Alternativa Gratuita: Edge-TTS

Se preferir não usar o Google, podemos implementar o Edge-TTS (Microsoft) que é gratuito:

```bash
npm install edge-tts
```

Isso daria vozes em português de alta qualidade sem necessidade de API key!

## Status Atual
- ❌ Google TTS não está ativo na sua conta
- ✅ A chave API está configurada corretamente
- ✅ O sistema tem fallback para áudio placeholder

Após ativar a API, reinicie o servidor para testar!