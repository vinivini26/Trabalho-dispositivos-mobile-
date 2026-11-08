# RotaFit — vinivini26

Relatório de implementação e verificação — 08/11/2026.
Repositório: [vinivini26/Trabalho-dispositivos-mobile-](https://github.com/vinivini26/Trabalho-dispositivos-mobile-).

## Pedido e escopo

O usuário confirmou que FinTrack, MarketGo e RotaFit são projetos diferentes da mesma
série e autorizou implementar o projeto 3 seguindo o PDF, verificar funcionalidade e
responsividade, enviar ao mesmo repositório e usar o nome GitHub como identificação.
Este texto é uma síntese do pedido, não uma transcrição de conversas indisponíveis.

Fonte: **RotaFit — Guia Passo a Passo**, 91 páginas, Prof. Me. Bruno Assunção Dias / IESB,
outubro de 2026. O guia foi usado como especificação de implementação. Não foram criadas
contas externas, configurados provedores com dados inventados nem publicados serviços em
nome do usuário. O envio do código ao GitHub foi solicitado explicitamente pelo usuário.

## Organização do repositório

A branch `marketgo-react-native`, commit `44f6fcc`, foi incorporada por fast-forward ao
trabalho atual, preservando o commit `9711bc2` do FinTrack. O RotaFit fica em `rotafit/`.
O README principal identifica **vinivini26** e apresenta os três aplicativos. As instruções
originais do FinTrack estão em `docs/FINTRACK.md`; seu código e relatório foram preservados.
O código do MarketGo também foi preservado. Commits antigos não foram reescritos.

## Implementação

Foram implementadas as telas e camadas do guia: login Google, guarda de sessão, início,
estatísticas semanais, corrida com GPS, histórico, resumo, perfil, temas persistentes,
componentes Liquid Glass, traçado SVG e integração Spotify. Schema SQL, RLS e testes
locais do banco acompanham o código.

A identificação de autoria usa `vinivini26`. O nome do aplicativo permanece **RotaFit**.
Os identificadores nativos são `com.vinivini26.rotafit`.

## Problemas encontrados e soluções

1. **O checkout continha apenas FinTrack.** A inspeção remota localizou MarketGo em outra
   branch. O histórico foi incorporado sem substituir os aplicativos anteriores.
2. **Extração do PDF:** quebras de página interrompiam strings e linhas com emojis; algumas
   explicações começavam em fonte de código. A extração foi corrigida e os arquivos foram
   conferidos por TypeScript, testes e empacotamento.
3. **Login Google do guia importava uma API interna do Expo removida na versão atual.**
   Substituída pela leitura da URL de callback e `exchangeCodeForSession`, com PKCE no
   cliente Supabase. Rotas de retorno entregam o controle à guarda de sessão. O login
   real ainda depende de configuração dos provedores e teste em aparelho.
4. **App encerrava ao importar o Supabase sem variáveis.** Agora mostra configuração inicial
   e permite conferir o tema, sem apresentar login ou conexão falsos.
5. **Pausa no instante zero era tratada como ausência de pausa.** Comparação explícita com
   `null` e teste de regressão. Deslocamento entre pausa e retomada não soma distância.
6. **Falhas e concorrência do GPS:** assinatura tardia após sair da tela é removida;
   GPS indisponível não deixa a corrida ativa; baixa precisão é filtrada; erro do sensor
   pausa e informa o usuário. Ao sair do primeiro plano, a corrida é pausada explicitamente.
7. **Finalização após erro de rede:** os dados e a duração são congelados. Existe ação para
   repetir o salvamento. Um UUID estável evita duplicação quando a primeira gravação
   ocorreu, mas sua resposta foi perdida; a leitura continua sujeita ao RLS do usuário.
8. **Proteção da corrida ativa:** navegação bloqueada até finalizar ou descartar, usando
   `usePreventRemove` do Expo Router. A liberação precede a navegação de saída.
9. **Spotify:** tokens isolados por conta no armazenamento seguro nativo; erros de OAuth,
   renovação, ausência de configuração, dispositivo inativo e exigência de Premium são
   tratados. Falhas de controle aparecem na interface com nova tentativa.
10. **Responsividade e contraste:** perfil/login/corrida com rolagem, áreas seguras e limites
    de largura; valores com ajuste de fonte; botões de ação com fundo mais opaco.
11. **Traçado horizontal invisível:** um gradiente SVG baseado em bounding box degenerava
    em uma linha perfeitamente reta. A unidade do gradiente passou a ser o espaço do SVG;
    projeções sem variação em um dos eixos também foram centralizadas.
12. **Ritmo podia mostrar 60 segundos após arredondamento.** O total é arredondado antes
    de separar minutos e segundos; teste cobre a passagem para o próximo minuto.
13. **Compilação Android exigiu JDK 17.** O ambiente possuía JDK 21. Foi instalado Temurin
    17.0.21+9 fora do repositório, com SHA-256 conferido contra o checksum do fornecedor.
    Uma tentativa pelo distribuidor Microsoft encontrou domínio de download não permitido;
    o artefato oficial Temurin estava disponível pelos domínios já autorizados.
14. **Dependência nativa incompatível:** `expo-font` foi resolvido como SDK 58 por um peer
    aberto; o autolinking Android falhou por metadados de publicação incompatíveis. Fixada
    explicitamente a versão da matriz do SDK 57 no package.json e lockfile. Isso reforça
    por que exportar JavaScript não equivale a compilar o aplicativo nativo.
15. **Kotlin tentou escrever no diretório pessoal somente leitura.** Na execução de
    verificação, os diretórios de dados foram direcionados a `work/` e a compilação foi
    configurada em processo. Não houve alteração no código do app para contornar permissões.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| TypeScript (`npm run typecheck`) | Aprovado |
| Regras e hooks (`npm run test:app`) | 6 suítes, 41 testes aprovados |
| Banco (`npm run test:db`) | 3 grupos, 11 testes aprovados |
| Formatação Prettier | Aprovada |
| Matriz Expo (`expo install --check`, offline) | Compatível com a matriz instalada; checagem não consulta o serviço Expo |
| Interface em Chromium | 29 verificações aprovadas; serviços e GPS simulados |
| Exportação Android | Bundle JavaScript/Hermes gerado; 1.599 módulos |
| APK Android nativo (`assembleDebug`) | Bloqueado por HTTP 403 ao acessar `www.jitpack.io`; APK não gerado |
| Sem credenciais | Tela de configuração testada em 320×568, tema persistente, sem erro JS ou overflow |

Ambiente de verificação: Node 24.19.0 e Chromium 154.0.8037.57.

Os 52 testes de regras/hooks e banco não dependem de credenciais reais. Foram removidos
o utilitário e os testes de dinheiro herdados da série, pois não pertencem ao RotaFit.
As verificações adicionais cobrem falhas e condições de borda da corrida e do salvamento.

O teste de interface usa a aplicação React Native Web como instrumento de inspeção.
Em 320×568, 390×844 e 768×1024, cobre: histórico vazio, temas, persistência ao recarregar,
mensagem de Spotify 403, iniciar, receber pontos GPS simulados, pausar, retomar, finalizar,
salvar, mostrar resumo, excluir e atualizar o histórico. Em 390×844, injeta uma falha no
salvamento e compara os payloads das duas tentativas. Também verifica ausência de erros
JavaScript e overflow horizontal. Capturas estão em `docs/capturas/`.

## Homologação real pendente

Não foram fornecidas credenciais Supabase/Google/Spotify nem conectado um aparelho físico.
Assim, ainda não foram homologados login Google real, OAuth/controle Spotify real, GPS ao
ar livre, instalação em celular, acessibilidade nativa nem comportamento em iOS.
Capturas e testes simulados não comprovam essas integrações externas.

Roteiro de aceite em aparelho:

1. Configurar Supabase, Google e Spotify conforme README e instalar uma compilação nativa.
2. Entrar com Google, cancelar um login, sair, reabrir sessão e entrar com outra conta.
3. Negar localização; permitir novamente; desligar/ligar GPS e conferir mensagens.
4. Correr/caminhar ao ar livre: conferir distância, tempo, ritmo e traçado.
5. Pausar, deslocar-se e retomar: conferir tempo e distância; bloquear a tela deve pausar.
6. Finalizar, conferir resumo/histórico e estatísticas; excluir uma corrida.
7. Desligar internet ao salvar, restabelecer e repetir; conferir uma única corrida no banco.
8. Alternar temas, reabrir o app e verificar em celular pequeno e tablet.
9. Conectar Spotify com conta autorizada e aparelho ativo; testar faixa atual e comandos.
   Conferir orientação de Premium/dispositivo quando a operação não é permitida.
10. Entrar com outro Google e conferir isolamento das corridas e da sessão Spotify.
11. Registrar modelo do aparelho, versões, resultados e capturas reais.

O app controla o Spotify, sem streaming próprio. Não há rastreamento em segundo plano
nem fila persistente de corridas offline. Dados de corrida não salvos se perdem se o
processo for encerrado; a interface orienta manter a tela aberta e repetir o envio.

## Compilação nativa: resultado e bloqueio

`expo prebuild --platform android --no-install` gerou o projeto nativo corretamente.
Foram instaladas e conferidas as ferramentas necessárias: JDK 17.0.21+9 e NDK
27.1.12297006, além do SDK/Build Tools 36 existente. O diagnóstico inicial do Android
citava NDK 27.0 como padrão; a versão efetivamente fixada pelo catálogo Expo/React
Native era 27.1.12297006. Foi usada essa versão, e os módulos nativos foram configurados.
Os diretórios nativos gerados e os caches não fazem parte do commit.

A tentativa final de `assembleDebug`, para arm64-v8a, parou ao resolver:

```text
com.github.Dimezis:BlurView:version-3.1.0
https://www.jitpack.io/com/github/Dimezis/BlurView/version-3.1.0/BlurView-version-3.1.0.pom
Received status code 403 from server: Forbidden
BUILD FAILED in 2m 43s
```

A dependência vem de `expo-blur`. O domínio não está permitido na política de rede
deste ambiente. Não houve tentativa de contornar a política, desabilitar TLS ou retirar
o efeito solicitado para mascarar a falha. Para concluir a compilação neste ambiente,
é necessário permitir `www.jitpack.io` nas configurações de rede e repetir o build.
O trecho de erro está em `docs/VALIDACAO_NATIVA.txt`.

**Não há APK validado nesta entrega.** O bundle Android aprovado comprova o empacotamento
JavaScript/Hermes; não substitui compilação nativa, instalação nem teste em aparelho.
