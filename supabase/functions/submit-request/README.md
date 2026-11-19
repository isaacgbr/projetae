# Amostra de backend — envio do Briefing

Amostra técnica da Edge Function de envio do Projetaê, escrita em TypeScript com APIs nativas de Deno e Fetch. Demonstra validação de entrada, tratamento de erros e separação entre o contrato HTTP e a persistência.

## Contrato e responsabilidades

Recebe um `POST` JSON com os campos do Briefing: contato, tipo de projeto, objetivos e referências opcionais. Exige pelo menos um contato válido, rejeita campos desconhecidos e limita tipos, formatos e tamanho do corpo.

`handler.ts` expõe `createHandler`, que recebe configuração e transporte HTTP por injeção. A configuração não contém valores do ambiente real neste repositório. `index.ts` é o adaptador para o runtime Deno; o serviço de persistência e sua implantação não são fornecidos nesta versão.

A função só retorna `201` com `{"ok":true}` após a confirmação da gravação. Entradas inválidas recebem erros controlados; falhas de rede ou persistência não expõem respostas internas. CORS restringe origens de navegador, mas não substitui autenticação ou proteção contra abuso.

## Testes isolados

Com Node.js 24, na raiz do repositório:

```sh
node --test supabase/tests/submit-request.test.mjs
```

Os testes usam domínios de exemplo, valores fictícios e transporte simulado. Cobrem validação, limites, CORS, falhas de persistência e confirmação de envio, sem acessar rede ou banco real. A amostra não inclui migrations, dados de clientes ou instruções de produção.
