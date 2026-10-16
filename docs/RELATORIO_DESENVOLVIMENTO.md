# Relatório de desenvolvimento — FinTrack

## Registro 001 — requisitos e decisão técnica

Solicitação: “FinTrack, Gerenciador Financeiro Pessoal. Diferencial: Integração Open Finance”. O usuário pediu desenvolvimento guiado, passo a passo, inicialmente apenas APK Android, e registro dos erros, prompts, respostas das IAs e implementação das soluções.

Prompt de confirmação do usuário: “pode usar o flutter”.

Resposta da IA (síntese, não transcrição literal): criar a base Flutter, uma tela inicial e um teste, preparar a compilação Android e documentar os resultados.

Implementação: `lib/main.dart`, `pubspec.yaml`, `test/widget_test.dart`, instruções no README e script de preparação Android. Saldo inicial vazio; nenhuma transação fictícia ou conexão bancária simulada. As funcionalidades serão construídas em etapas seguintes.

## Registro 002 — ferramentas indisponíveis

Diagnóstico: checkout vazio; Flutter e Dart ausentes; Java 21 disponível. O acesso Git ao repositório Flutter funcionou.

Erro real ao executar `flutter --version`: `curl: (56) CONNECT tunnel failed, response 403` durante o download do SDK Dart em `storage.googleapis.com`.

Resposta da IA (síntese): declarar o domínio necessário nas configurações do ambiente e continuar criando arquivos que não dependem da execução do SDK.

Solução implementada parcialmente: domínio salvo no rascunho da política de rede. A execução posterior de Flutter ainda recebeu HTTP 403; a correção depende de aplicar a configuração. Não foram desabilitadas verificações TLS. O SDK Flutter foi clonado fora do aplicativo, em `/workspace/flutter-sdk`.

Estado: bloqueio de infraestrutura pendente. Análise Dart, teste de widget e geração do APK não executados. Ainda não há APK disponível nem confirmação de funcionamento em Android.

## Como continuar os registros

Em cada etapa acrescentar: pedido/prompt relevante, resposta da IA (identificar sínteses), erro observado, diagnóstico, arquivos alterados, solução aplicada, comandos de verificação e resultados reais. Não registrar credenciais, dados bancários ou conteúdo sensível. Não apresentar comandos não executados como testes aprovados.

## Registro 003 — recuperação e validação da base

A liberação de `storage.googleapis.com` passou a funcionar. Instalado Flutter 3.47.7 / Dart 3.13.5 e ferramentas Android (plataforma 36 e build-tools 36.0.0). Os caches padrão eram somente leitura: configurados PUB_CACHE, XDG_CONFIG_HOME, ANDROID_USER_HOME e GRADLE_USER_HOME em `/workspace`, com permissão adicional para diretórios de configuração Dart. A estrutura `android/` foi gerada pelo template oficial Flutter, sem substituir a interface criada.

Verificações executadas: `flutter analyze` passou sem problemas; `flutter test` executou 1 teste e passou. `dart format lib test` concluído.

Primeira tentativa de APK falhou com `java.net.UnknownHostException: services.gradle.org`. Diagnóstico: Java/Gradle precisa de configuração explícita do proxy. Configurado proxy em `/workspace/.gradle/gradle.properties`, fora do projeto, e iniciada nova compilação.

## Registro 004 — simplificação solicitada

Prompt do usuário: “pode ser algo simples, imagine um estudante de um curso de ADS fazendo”.

Resposta da IA (síntese): manter interface e código simples; implementar receitas, despesas, categorias e saldo em etapas, com persistência local. Open Finance permanece uma etapa futura, sem fingir integração real. Relatório direto e baseado nos resultados observados.

## Registro 005 — compilador Java ausente

Após configurar o proxy, o Gradle baixou suas dependências, mas o build falhou: `Toolchain installation '/usr/lib/jvm/java-21-openjdk-amd64' does not provide the required capabilities: [JAVA_COMPILER]`.

Diagnóstico: a máquina possuía somente runtime Java; `javac` estava ausente. Solução em andamento: instalar JDK 21 completo em `/workspace/java`, verificando SHA-256 contra o arquivo publicado pelo fornecedor, e usar JAVA_HOME na nova tentativa. Nenhuma alteração na lógica do aplicativo foi necessária.

## Registro 006 — certificados do JDK

JDK 21.0.12.1 instalado e SHA-256 conferido com o checksum oficial. `javac -version` executado com sucesso. O JDK separado não confiava inicialmente no certificado do proxy: erro `PKIX path building failed`. Configurado `systemProp.javax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts` no Gradle local, reutilizando os certificados do sistema, sem desabilitar TLS. A tentativa seguinte avançou no download das bibliotecas Android.

## Resultado da etapa 1

Compilação concluída com sucesso: `flutter build apk --debug`, saída `build/app/outputs/flutter-apk/app-debug.apk`. Análise sem problemas e 1 teste de interface aprovado. APK de desenvolvimento; ainda não instalado nem testado em um celular físico. Cadastro de movimentações, persistência e Open Finance ainda não implementados.
