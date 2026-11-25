---
title: "ChatRoom — Relatório de desenvolvimento"
subtitle: "React Native, Expo e Supabase"
date: "25 de novembro de 2026"
lang: pt-BR
---

## Objetivo e fontes

O ChatRoom é um aplicativo de mensagens em salas públicas. Pessoas autenticadas podem listar e criar salas, entrar e sair de uma sala, enviar e apagar suas próprias mensagens e editar o nome do perfil. O banco autoriza leitura e envio de mensagens com base na participação. O Supabase Realtime fornece eventos de mensagens, presença e indicação de digitação.

O projeto foi montado a partir de *ChatRoom — Guia de construção passo a passo*, Prof. Me. Bruno Assunção Dias, IESB, setembro de 2026. A cópia de trabalho do repositório continha FinTrack, MarketGo e RotaFit. O ChatRoom foi acrescentado na pasta `chatroom/`, com dependências próprias.

## Prompt e resposta de IA registrados

**Prompt real do solicitante**

> Criar um relatórios com todas as soluções de correção que foram apresentados durante o desenvolvimento do projeto, como erros, prompts utilizados, respostas das IAs e como foi implementado a solução para seguir com o projeto.
>
> Enviar o diretório do projeto funcional.

**Resposta inicial da IA nesta entrega**

> Vou ler o guia e procurar o código e os registros do ChatRoom. No relatório, vou distinguir o que estiver documentado das correções que eu verificar durante esta entrega.

A investigação encontrou o guia e os três projetos anteriores. A resposta técnica foi implementar o ChatRoom em uma pasta própria, completar os trechos ausentes, aplicar as correções abaixo e verificar a entrega localmente.

O PDF registra soluções técnicas e resultados de teste. As transcrições dos prompts e das respostas de IA usados no desenvolvimento original estão indisponíveis nas fontes fornecidas. Por isso, as duas correções históricas abaixo são atribuídas ao guia, sem autoria de IA presumida.

## Erros reais relatados no guia

### Recursão na política de participação

**Sintoma.** O teste em que um membro consulta colegas da sala falhou com `infinite recursion detected in policy for relation room_members` (páginas 12–14 e 21).

**Causa.** A política de leitura consultava a própria tabela que protegia. O Postgres tentava reaplicar a política à subconsulta.

**Implementação.** Em `supabase/schema.sql`, a política chama `public.is_room_member(room_id)`. A função `SECURITY DEFINER` verifica a participação do usuário identificado por `auth.uid()`, com `search_path` fixo e permissão de execução concedida ao papel autenticado. Os testes verificam a leitura entre colegas e a restrição para quem está fora da sala.

### Expectativa incorreta no teste de atualização

**Sintoma.** Um teste esperava uma exceção ao tentar atualizar o perfil de outra pessoa (página 21).

**Causa.** A condição `USING` da política torna a linha invisível para a atualização. A operação pode terminar normalmente com zero linhas afetadas.

**Implementação.** O teste de banco confere zero linhas afetadas e verifica que o nome original permaneceu no banco. O caso passou na suíte PGlite desta entrega.

## Correções implementadas nesta entrega

| Problema | Solução aplicada | Evidência |
|---|---|---|
| O PDF referencia módulos auxiliares sem fornecer seus blocos de código. A extração também perdeu emojis e trouxe um comando de terminal para um hook. | Foram implementados `friendlyError` e o tipo `IconName`; os emojis foram restaurados e o comando estranho foi removido. Os caminhos de ícones nativos de exemplo foram retirados da configuração, permitindo usar o padrão do Expo. | TypeScript e exportação Expo. |
| O npm tentou escrever em um diretório indisponível e produziu `ENOENT`. O Expo também tentou usar um diretório indisponível para cache e telemetria. | A instalação usou um cache gravável. As verificações do Expo foram executadas com telemetria desativada e validação local de dependências. Foi incluído um `package-lock.json` para instalar com `npm ci`. | Instalação concluída e bundles gerados. |
| A instalação limpa do ZIP falhava com `ERESOLVE`. | Foram fixados `react-native-reanimated@4.5.1` e `react-native-worklets@0.10.1`, as versões do SDK Expo 57. O lockfile foi atualizado. | Instalação limpa com `npm ci` e verificação de dependências. |
| Sem as variáveis de ambiente, o cliente original abortava na importação. | O layout mostra uma instrução de configuração, e a tela de login é carregada quando a URL e a chave pública estão preenchidas. A chave de exemplo fica em `.env.example`. | Rota inicial e configuração documentadas no README. |
| A lista de participações consultava todas as linhas visíveis pela política de membros. A tela da sala iniciava a busca de mensagens antes de confirmar a participação. | A consulta filtra `room_members` pelo próprio usuário. A tela aguarda a confirmação da participação para consultar mensagens e membros e abrir os canais correspondentes. | Revisão de código, tipagem e testes de RLS. |
| Criar a sala e inscrever o autor em duas requisições podia deixar uma sala criada após falha da segunda operação. | A função SQL `create_room` executa as duas inserções em uma transação. Ela usa o contexto do chamador e mantém o RLS. O serviço chama a função via RPC. | O teste PGlite de criação usa a mesma função. |
| O evento de inserção podia chegar antes da confirmação do envio e duplicar uma mensagem. Uma exclusão que falhasse removia o item local. | A confirmação troca o item temporário pela versão definitiva e deduplica pelo ID. Se o envio falha, o cache remove o item temporário e a tela recupera o texto quando o campo ainda está vazio. A exclusão local ocorre após sucesso. | Tipagem e inspeção do caminho de atualização do cache. |
| O guia filtrava eventos `DELETE` do Postgres Changes pela sala, um filtro que o Realtime não oferece para exclusões. | A inscrição de exclusão recebe o ID e remove somente um item correspondente no cache da sala aberta. `INSERT` mantém o filtro por sala, e a reconexão atualiza o histórico. Em Postgres Changes, os IDs de mensagens excluídas podem ser publicados sem o filtro por sala. | Mudança revisada no código. Homologação com o Supabase real pendente. |
| Diálogos nativos de confirmação não reproduziam o mesmo comportamento na web. | O utilitário de diálogo chama a interface nativa no celular e usa o diálogo do navegador na web. | Fluxo de sessão verificado no navegador com API simulada. |

## Solução de problemas documentada no guia

Os itens abaixo são cenários de diagnóstico do guia (páginas 8, 15 e 75), além dos dois erros históricos já descritos.

| Sintoma | Diagnóstico ou ação |
|---|---|
| `ERESOLVE` na instalação | Conferir se `react` e `react-dom` usam a mesma versão. |
| QR Code não abre | Verificar rede compartilhada ou usar `npx expo start --tunnel`. |
| Inserção chega ao banco, mas a mensagem não aparece no outro aparelho | Conferir a tabela `messages` na publicação `supabase_realtime`. |
| Variáveis do Supabase ausentes | Preencher `.env` e reiniciar o Expo. Usar `npx expo start -c` se for necessário limpar o cache. |
| Duas rotas para `/` | Remover a tela temporária `app/index.tsx` do teste inicial. |
| Perfil não aparece após cadastro | Conferir o gatilho `on_auth_user_created` ligado a `auth.users`. |
| Erro de RLS ao entrar em uma sala | Conferir se a operação usa o ID do usuário autenticado. |
| `permission denied for table messages` | Conferir os `GRANT` de leitura, inserção e exclusão no esquema. |
| Indicador de digitação fica visível | Verificar atualização e expiração. O cliente registra o instante de recebimento local e descarta avisos após cerca de três segundos, com verificação a cada segundo. |
| Contador de presença não atualiza | Verificar a conexão e a confirmação `SUBSCRIBED` antes de chamar `track()`. |
| Teste de banco não encontra o PGlite | Instalar as dependências de desenvolvimento com `npm ci`. |
| API não reflete uma alteração no esquema | Recarregar o cache do PostgREST com `notify pgrst, 'reload schema';`. |

## Verificação e entrega

- `npm run typecheck` concluiu sem erros.
- `npm test` passou em **32 testes**, sendo 20 de aplicação (Jest) e 12 de banco (PGlite).
- O Expo exportou os bundles web e Android. A exportação Android valida o empacotamento JavaScript para essa plataforma.
- Com Chromium e API simulada, passaram os fluxos de login, lista vazia, criação de sala, envio de mensagem, edição do perfil e encerramento da sessão. A tela inicial de configuração também foi observada na exportação sem credenciais.
- Para homologar o serviço real, configure o Supabase conforme o README e use duas sessões autenticadas na mesma sala. Confira chegada e exclusão de mensagens, contagem de presença, expiração de digitação e perda de acesso após sair.
- A pasta entregue inclui código-fonte, instruções, esquema SQL, testes e lockfile. As credenciais são configuradas localmente.
