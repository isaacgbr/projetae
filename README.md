# Briefing Web — Etapa A

Interface visual de um briefing para projetos digitais, em React, TypeScript, Vite e Tailwind CSS. Paleta creme e grafite, componentes reutilizáveis, cinco etapas e layout responsivo.

## Executar localmente

```sh
npm install
npm run dev
```

## Verificações

```sh
npm run build
npm run lint
```

`npm run preview` permite conferir o build localmente.

## Escopo

- Boas-vindas, Seu negócio, Seu projeto, Estilo e materiais, Revisão e envio.
- Navegação pelas etapas, campos ilustrativos e botão de envio desabilitado.
- Os campos não têm validação definitiva. O conteúdo digitado é descartado ao mudar de etapa; a revisão apresenta somente a estrutura do briefing.
- Nenhuma resposta é armazenada, transmitida ou enviada. Não há backend, banco, autenticação, uploads, e-mail, integrações ou publicação.
- Animações CSS respeitam `prefers-reduced-motion`; navegação por teclado, rótulos e foco de título estão implementados.

## Organização

- `src/App.tsx`: composição das telas e estado da navegação.
- `src/components/BriefingUI.tsx`: campos, progresso, aviso e ícone reutilizáveis.
- `src/content.ts`: textos e configuração dos campos por etapa.
- `src/index.css`: tokens visuais, componentes, responsividade e movimento.
- `vite.config.ts`: plugins de React e Tailwind CSS.

Etapas futuras dependem de escopo próprio. O envio real está indisponível nesta versão.
