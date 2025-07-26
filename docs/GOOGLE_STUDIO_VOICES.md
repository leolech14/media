# Google Cloud Text-to-Speech Studio Voices

## Vozes WaveNet (Premium - Mais Naturais)

As vozes WaveNet são geradas usando redes neurais profundas e soam muito mais naturais que as vozes padrão. São as mesmas usadas no Google AI Studio.

### Português Brasil - WaveNet

1. **pt-BR-Wavenet-A** - Feminina Natural e Sofisticada
   - Tom: Médio, profissional
   - Ideal para: Narrações educativas, apresentações corporativas
   - Característica: Voz clara e articulada

2. **pt-BR-Wavenet-B** - Masculina Profissional  
   - Tom: Grave, autoritativo
   - Ideal para: Documentários, tutoriais técnicos
   - Característica: Voz confiável e séria

3. **pt-BR-Wavenet-C** - Feminina Jovem e Dinâmica
   - Tom: Agudo, energético
   - Ideal para: Conteúdo para jovens, redes sociais
   - Característica: Voz animada e expressiva

## Vozes Neural2 (Avançadas)

Vozes de segunda geração com melhor prosódia e entonação.

1. **pt-BR-Neural2-A** - Feminina Clara
2. **pt-BR-Neural2-B** - Masculina Formal  
3. **pt-BR-Neural2-C** - Feminina Amigável

## Configurações Recomendadas

### Para Vídeos Educativos
- Voz: `pt-BR-Wavenet-A`
- Velocidade: 1.0x
- Tom: 0 (neutro)

### Para Redes Sociais
- Voz: `pt-BR-Wavenet-C`
- Velocidade: 1.1x
- Tom: +2 (mais agudo)

### Para Conteúdo Corporativo
- Voz: `pt-BR-Wavenet-B`
- Velocidade: 0.95x
- Tom: -2 (mais grave)

## Custos

- WaveNet: $16 por 1 milhão de caracteres
- Neural2: $16 por 1 milhão de caracteres
- Standard: $4 por 1 milhão de caracteres

Para vídeos de 30 segundos (~400 caracteres), o custo é mínimo.

## API Key vs Service Account

Para produção, recomenda-se usar Service Account em vez de API Key para maior segurança e controle de cotas.