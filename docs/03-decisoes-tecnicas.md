# Decisões técnicas

## Jornada em estado local

O fluxo principal ocorre em uma única aplicação React e não depende de rotas para cada etapa. Isso mantém a navegação do formulário simples, preserva respostas ao voltar entre etapas e permite controle explícito de foco e validação.

## Validação em duas fronteiras

O cliente valida cedo para orientar a pessoa durante o preenchimento. O serviço de envio continua sendo a fronteira responsável por aceitar ou rejeitar a solicitação; a interface trata respostas por categoria e mantém os dados disponíveis em caso de falha.

## Integrações isoladas

A chamada HTTP fica em um módulo de serviço, separada dos componentes. A verificação antiabuso também possui um componente próprio e carrega seu script sob demanda. Essa separação reduz o acoplamento entre formulário, proteção e transporte.

## Confirmação como estado fechado

Depois do sucesso, a aplicação preserva uma cópia das respostas em modo somente leitura. Uma solicitação enviada não pode ser editada nem atualizada pela confirmação; a alternativa é iniciar um novo Briefing.

## Movimento com alternativa acessível

A animação de envio comunica progresso e conclusão, mas pode ser pulada e respeita a preferência de movimento reduzido. A informação essencial e as ações permanecem disponíveis sem depender da animação.

## Repositório público delimitado

Esta versão apresenta o frontend e sua fronteira de integração. Os demais serviços e dados de produção não fazem parte do escopo público.
