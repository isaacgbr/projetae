# Edge Function — envio do Briefing

Amostra técnica do backend de envio do Projetaê, escrita em TypeScript para o runtime Deno. O código público demonstra o contrato HTTP e as proteções aplicadas antes da persistência, sem incluir configurações operacionais do produto real.

## Responsabilidades

- aceitar somente requisições `POST` em JSON e limitar o tamanho do corpo;
- validar tipos, formatos, campos permitidos e regras do Briefing no servidor;
- restringir origens de navegador por CORS;
- rejeitar o honeypot quando preenchido;
- verificar o token do Cloudflare Turnstile, incluindo ação e hostname esperados;
- persistir apenas os campos explicitamente permitidos;
- devolver erros controlados sem expor respostas internas ou credenciais.

O Turnstile e o honeypot oferecem proteção básica contra abuso. Eles complementam as validações do servidor, mas não substituem controles adicionais de segurança e observabilidade no ambiente real.

## Organização

- `handler.ts`: validação, CORS, proteção antiabuso e contrato de persistência por injeção de dependência.
- `index.ts`: adaptador mínimo para o runtime da Edge Function.
- `../../tests/submit-request.test.mjs`: testes isolados com domínios, tokens e respostas fictícias.

## Testes

Na raiz do repositório:

```sh
node --test supabase/tests/submit-request.test.mjs
```

Os testes não acessam rede ou banco real. Configurações de implantação, migrations, dados e procedimentos de produção não fazem parte desta versão pública.
