-- Tarefa: Criar migration inicial das solicitações do Briefing.
-- Fonte dos dez campos de respostas: Answers, em src/content.ts.
-- Aplicar em um projeto Supabase; esta migration não cria usuários ou chaves.

begin;

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'recebida',

  phone text not null default '',
  email text not null default '',
  project text not null,
  project_description text not null default '', -- Answers.projectDescription
  objectives text[] not null,
  other_objective text not null default '', -- Answers.otherObjective
  link text not null default '',
  notes text not null default '',
  visual_direction text not null default '', -- Answers.visualDirection
  custom_colors text[] not null default '{}'::text[], -- Answers.customColors

  constraint requests_contact_required check (
    btrim(phone) <> '' or btrim(email) <> ''
  ),
  constraint requests_project_valid check (
    project in (
      'Landing Page',
      'Site Institucional',
      'Catálogo Digital',
      'Portfólio Profissional',
      'Ainda não sei qual escolher'
    )
  ),
  constraint requests_project_description_required check (
    project <> 'Ainda não sei qual escolher' or btrim(project_description) <> ''
  ),
  constraint requests_objectives_valid check (
    cardinality(objectives) > 0
    and array_ndims(objectives) = 1
    and array_position(objectives, null) is null
    and objectives <@ array[
      'Conseguir novos clientes',
      'Apresentar meu negócio',
      'Divulgar produtos ou serviços',
      'Receber pedidos ou orçamentos',
      'Fortalecer minha presença profissional',
      'Outro'
    ]::text[]
  ),
  constraint requests_other_objective_required check (
    not ('Outro' = any(objectives)) or btrim(other_objective) <> ''
  ),
  constraint requests_visual_direction_valid check (
    visual_direction in (
      '', 'Minimalista', 'Elegante', 'Criativo', 'Escuro / Impactante',
      'Não tenho preferência', 'Personalizado'
    )
  ),
  constraint requests_custom_colors_valid check (
    cardinality(custom_colors) = 0
    or (
      array_ndims(custom_colors) = 1
      and cardinality(custom_colors) <= 4
      and array_position(custom_colors, null) is null
      and array_to_string(custom_colors, ',') ~ '^#[0-9A-Fa-f]{6}(,#[0-9A-Fa-f]{6}){0,3}$'
    )
  ),
  constraint requests_status_not_blank check (btrim(status) <> '')
);

-- Sem policies: nenhuma linha é acessível por papéis sujeitos à RLS.
alter table public.requests enable row level security;

-- Revogar também grants automáticos que possam existir no projeto Supabase.
revoke all privileges on table public.requests from public, anon, authenticated;

-- A futura Edge Function usará credencial de servidor, nunca do navegador.
-- service_role ignora RLS; limitar aqui suas operações a inserir e consultar.
revoke all privileges on table public.requests from service_role;
grant insert, select on table public.requests to service_role;

-- Isaac também fica bloqueado nesta etapa. Uma migration futura deverá conceder
-- SELECT a authenticated E criar policy restrita ao auth.uid() real de Isaac.
-- Não conceder leitura a todos os autenticados, nem INSERT ao cliente público.
-- Formatos de contato/link e limites de entrada serão validados na Edge Function.
-- Não há protocolo, tracking público, anexos ou campos de respostas adicionais.

commit;
