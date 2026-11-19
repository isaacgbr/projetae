![Projetaê — Sua ideia começa aqui.](docs/assets/projetae-cover.png)

<p align="center">Uma experiência guiada para transformar ideias em solicitações claras de projetos digitais.</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-292D2D?style=flat&amp;logo=react&amp;logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-292D2D?style=flat&amp;logo=typescript&amp;logoColor=3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-292D2D?style=flat&amp;logo=vite&amp;logoColor=646CFF" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-292D2D?style=flat&amp;logo=tailwindcss&amp;logoColor=06B6D4" alt="Tailwind CSS">
</p>

## Sobre

O Projetaê organiza as informações essenciais de uma ideia antes do início de um projeto digital. Em vez de depender de mensagens dispersas, a pessoa percorre um briefing guiado, revisa suas respostas e envia uma solicitação estruturada para análise.

**Landing → Briefing → Revisão → Envio → Confirmação**

## Destaques

- Landing responsiva com identidade visual própria e navegação acessível.
- Briefing em etapas com validação, progresso, revisão e edição das respostas.
- Fluxo de envio integrado, com Cloudflare Turnstile, honeypot e bloqueio de envios duplicados.
- Estados de carregamento, erro, nova tentativa e confirmação animada.

## Arquitetura

| Camada | Responsabilidade | Tecnologias |
| --- | --- | --- |
| Interface | Landing, briefing, revisão e experiência de confirmação | React, TypeScript, CSS, Tailwind CSS |
| Build e qualidade | Desenvolvimento, compilação e análise estática | Vite, TypeScript, Oxlint |
| Integração | Cliente HTTP e tratamento dos estados de envio | Fetch API |

## Executar localmente

Com Node.js e npm instalados:

```sh
npm install
npm run dev
```

A execução local apresenta toda a experiência de interface, mas não inclui valores nem serviços privados de produção.

## Verificações

```sh
npm run lint
npm run build
```

Este repositório é a versão pública de portfólio do Projetaê. Backend, componentes administrativos, configurações operacionais e dados do produto real permanecem privados.

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
