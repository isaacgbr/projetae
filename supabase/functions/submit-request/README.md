# Envio de solicitações do Briefing

Tarefa: Preparar Edge Function de envio do Briefing.

Função pública `submit-request`, sem login do cliente. Usa `Deno.serve` e `fetch`
nativos, sem dependências externas. A gravação usa a API REST do Supabase com
credencial de servidor; a tabela mantém as permissões da migration existente.
Não há leitura pública, protocolo, tracking ou integração com o frontend.

## Contrato HTTP

`POST /functions/v1/submit-request`, com `Content-Type: application/json`.
Os nomes HTTP seguem `Answers`, em `src/content.ts`, em camelCase.

```json
{
  "phone": "",
  "email": "cliente@example.com",
  "project": "Landing Page",
  "projectDescription": "",
  "objectives": ["Conseguir novos clientes"],
  "otherObjective": "",
  "link": "",
  "notes": "",
  "visualDirection": "",
  "customColors": []
}
```

Campos opcionais ausentes viram texto vazio ou lista vazia. Pelo menos um contato
válido, projeto e objetivos são obrigatórios. Se preencher ambos os contatos,
ambos devem ser válidos. Descrição é obrigatória para projeto indefinido;
complemento é obrigatório para objetivo `Outro`. Campos desconhecidos, `null`,
tipos incorretos e tentativas de definir ID, data ou status são recusados.

O servidor converte somente os dez campos para as colunas da migration
`supabase/migrations/001_create_requests.sql`. UUID, data e status usam os defaults
do banco. As cores são validadas em qualquer direção visual, conforme a migration.
Links são apenas armazenados, nunca acessados pela função.

Limite total de 32 KiB em bytes, mesmo sem `Content-Length`. Limites por texto:
telefone 32, e-mail 254, projeto 100, descrição 4.000, outro objetivo 2.000,
link 2.048, observações 8.000 e direção visual 80 caracteres. Até seis objetivos
e quatro cores hexadecimais `#RRGGBB`. Textos são aparados nas extremidades.

| Status | Resultado |
| --- | --- |
| 201 | Inserção confirmada: `{"ok":true}`; sem ID, respostas ou protocolo. |
| 204 | Preflight CORS (`OPTIONS`). |
| 400 | JSON inválido. |
| 403 | Origem não permitida. |
| 405 | Método diferente de POST/OPTIONS. |
| 413 | Corpo acima do limite. |
| 415 | Content-Type incompatível. |
| 422 | Campos inválidos; mensagens em `fields`, sem repetir seus valores. |
| 502 | Salvamento não confirmado; erro do banco/rede ou timeout de 10 segundos. |
| 503 | Configuração do servidor ausente ou inválida. |

## Configuração no Supabase

- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: variáveis padrão do ambiente de
  Edge Functions hospedado. Conferir sua disponibilidade no projeto. A chave
  fica exclusivamente no servidor e ignora RLS; nunca usar em `VITE_*`, respostas,
  logs, frontend ou Git.
- `BRIEFING_ALLOWED_ORIGINS`: configurar no ambiente da função com origens
  completas, separadas por vírgula, sem caminhos nem barra final. Exemplo fictício:
  `https://projetae.example.com,http://localhost:5173`. Listar somente origens
  efetivamente necessárias; não há fallback para `*`.
- `supabase/config.toml`: `verify_jwt = false` somente para `submit-request`, pois
  o visitante envia sem conta. A função não usa o token do visitante para gravar.
- A Data API deve estar habilitada para o schema `public`, mantendo RLS e os
  grants da migration. Expor o schema na API não concede acesso à tabela.

CORS controla o acesso pelo navegador, não autentica clientes HTTP nem impede
spam. Chamadas sem `Origin` são aceitas. Antes da abertura pública, definir a
proteção contra abuso (limitação de frequência e/ou CAPTCHA); não há essa proteção
nesta etapa. Não há deduplicação nem repetição automática: uma falha de rede pode
ocorrer depois de o banco gravar. Retentar pode gerar outra solicitação.

## Validação e publicação futura

Testes do handler, sem rede e sem banco, usando o Node 24 já disponível:

```sh
node --test supabase/tests/submit-request.test.mjs
```

Quando Deno estiver disponível, executar `deno check` nos arquivos da função.
Depois, em ambiente autorizado, validar a inserção real e as permissões, configurar
as origens e proteção contra abuso e publicar somente `submit-request` no projeto
correto, preservando `verify_jwt = false`. Não reaplicar a migration já executada.
Nenhuma configuração remota ou publicação é feita por estes arquivos.

Referências: [funções públicas](https://supabase.com/docs/guides/functions/auth),
[variáveis de ambiente](https://supabase.com/docs/guides/functions/secrets) e
[API de dados](https://supabase.com/docs/guides/api).
