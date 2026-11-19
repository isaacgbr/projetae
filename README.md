![Projetaê — Sua ideia começa aqui.](docs/assets/projetae-cover.png)

![React](https://img.shields.io/badge/React-292D2D?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-292D2D?style=flat&logo=typescript&logoColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-292D2D?style=flat&logo=vite&logoColor=646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-292D2D?style=flat&logo=tailwindcss&logoColor=06B6D4)

🚧 **Projeto em desenvolvimento.**

## Sobre o Projetaê

O Projetaê ajuda pessoas a transformar uma ideia em uma solicitação clara de projeto digital. O briefing guiado reúne objetivos, contatos e referências para facilitar o entendimento da proposta.

**Landing → Briefing guiado → revisão → envio da solicitação → confirmação.**

O frontend oferece navegação em etapas, validação dos campos, revisão e edição das respostas, layout responsivo e uma experiência visual de envio com tratamento de falhas. As respostas permanecem em memória durante a navegação; recarregar a página descarta os dados.

O produto possui integração real de envio. Este repositório é sua versão de portfólio: apresenta a experiência e uma amostra técnica do backend, omitindo componentes administrativos e configurações privadas. A execução local não inclui um serviço de envio configurado.

## Arquitetura

React e TypeScript organizam a interface, o estado do briefing e o cliente HTTP. Vite e Tailwind CSS compõem a base de desenvolvimento e estilos. O cliente envia as respostas a uma Edge Function, que valida a entrada antes de solicitar a persistência no Supabase e devolve uma confirmação ou um erro tratado.

A [amostra de backend](supabase/functions/submit-request/README.md) inclui validações e testes isolados com dados fictícios. Configurações de implantação e migrations do produto não fazem parte desta versão.

## Executar localmente

Com Node.js e npm instalados, execute na pasta do projeto:

```sh
npm install
npm run dev
```

## Verificações

```sh
npm run lint
npm run build
node --test supabase/tests/submit-request.test.mjs
```

<p align="center">
  <img src="docs/assets/isaac-gabriel-avatar.png" alt="Isaac Gabriel" width="96" height="96">
  <br>
  <sub>Desenvolvido por</sub>
  <br>
  <strong>Isaac Gabriel</strong>
  <br><br>
  <a href="https://github.com/isaacgbr"><img src="https://img.shields.io/badge/GitHub-292D2D?style=flat&amp;logo=github&amp;logoColor=white" alt="GitHub de Isaac Gabriel" height="20"></a>
  <a href="https://www.linkedin.com/in/isaacgbr"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&amp;logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI%2BPHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNVY5aDMuNDE0djEuNTYxaC4wNDljLjQ3Ni0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZaTTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMSAxIDAtNC4xMjQgMi4wNjIgMi4wNjIgMCAwIDEgMCA0LjEyNFpNNy4xMTkgMjAuNDUySDMuNTU1VjloMy41NjR2MTEuNDUyWiIvPjwvc3ZnPg%3D%3D" alt="LinkedIn de Isaac Gabriel" height="20"></a>
</p>
