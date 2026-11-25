# ChatRoom

Aplicativo React Native para conversar em salas públicas. Inclui cadastro, login, perfil, criação de salas, mensagens, presença e indicação de digitação. A leitura e o envio de mensagens exigem participação na sala.

## Executar

1. Com Node.js 22.13 ou superior, entre em `chatroom/` e execute `npm ci`.
2. Crie um projeto Supabase vazio. Execute `supabase/schema.sql` uma vez no SQL Editor. O script cria as tabelas, habilita RLS e adiciona `messages` à publicação `supabase_realtime`.
3. Copie `.env.example` para `.env`. Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY` com a URL do projeto e a chave pública *publishable* ou *anon*.
4. Execute `npm run web` para abrir no navegador, ou `npm start` para abrir em um cliente Expo compatível com o SDK 57. Se a versão do Expo Go instalada for incompatível, use o navegador ou um build nativo.
5. Cadastre uma conta. Se a confirmação de e-mail estiver habilitada no Supabase, confirme o cadastro antes de entrar.

## Verificar

- `npm run typecheck` verifica o TypeScript.
- `npm test` executa os 20 testes Jest e os 12 testes de banco PGlite. Nenhum desses testes exige credenciais.
- Para homologar o Realtime, abra duas sessões independentes, entre com contas diferentes na mesma sala e confira envio, exclusão, presença e expiração do indicador de digitação. Saia da sala em uma sessão e confira que ela volta a pedir participação.

## Diretórios

- `app/` contém as rotas Expo Router.
- `src/` contém componentes, sessão, hooks, serviços e funções auxiliares.
- `supabase/` contém o esquema SQL e os testes de banco.
- `docs/` contém o relatório técnico com a origem de cada correção.

Consulte o [relatório técnico em PDF](docs/ChatRoom-Relatorio.pdf).

Base técnica: *ChatRoom — Guia de construção passo a passo*, Prof. Me. Bruno Assunção Dias, IESB, setembro de 2026.
