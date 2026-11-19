# Arquitetura

A versão pública é uma Single Page Application construída com React e TypeScript. O estado da jornada permanece no cliente durante o preenchimento; a integração externa acontece somente no envio.

## Organização

| Área | Responsabilidade |
| --- | --- |
| `src/components` | Landing, Briefing, validação visual e componentes de interface. |
| `src/features/submission` | Experiência animada e confirmação posterior ao envio. |
| `src/services` | Fronteira HTTP entre a interface e o serviço de recebimento. |
| `src/content.ts` | Modelo das respostas, opções do formulário e validações locais. |

## Fluxo de dados

```text
Landing
  → estado local do Briefing
  → validação e revisão
  → verificação antiabuso
  → serviço HTTP de envio
  → confirmação e revisão somente leitura
```

As respostas são copiadas antes do processamento final. Essa cópia alimenta o envio e a revisão pós-envio, evitando divergências durante uma operação assíncrona. Erros preservam o formulário e permitem nova tentativa; o estado só avança para a confirmação após uma resposta de sucesso.

## Ferramentas

- React e TypeScript para interface e modelagem.
- CSS e Tailwind CSS para estilos, responsividade e tokens de tema.
- Vite para desenvolvimento e build.
- Oxlint e TypeScript para análise estática.
- Fetch API para a integração HTTP.
