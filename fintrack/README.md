# Trabalho 1 — FinTrack

Gerenciador financeiro pessoal em Flutter, destinado inicialmente a APK Android.

[← Voltar aos três trabalhos](../README.md) · [Documentação do FinTrack](docs/README.md)

## Onde encontrar cada arquivo

| Caminho | Conteúdo |
| --- | --- |
| `lib/main.dart` | Tela inicial e tema do aplicativo. |
| `test/widget_test.dart` | Teste da interface inicial. |
| `android/` | Projeto nativo Android utilizado pelo Flutter. |
| `scripts/prepare_android.sh` | Instala dependências, verifica, testa e compila o APK. |
| `pubspec.yaml` / `pubspec.lock` | Dependências e versões do projeto Flutter. |
| [docs/](docs/README.md) | Relatório deste trabalho. |

## Etapa 1

Base da interface com saldo vazio e indicação explícita de que Open Finance ainda não está conectado. Não há cadastro, persistência nem integração bancária nesta etapa.

## Preparação e validação

Requer Flutter stable com Dart >= 3.10, Java 17 ou 21 e Android SDK compatível com a versão do Flutter. Configure o SDK Android e aceite suas licenças após lê-las (`flutter doctor --android-licenses`).

A partir da raiz do repositório, entre na pasta deste trabalho:

```sh
cd fintrack
```

Dentro de `fintrack/`, execute:

```sh
flutter doctor -v
bash scripts/prepare_android.sh
```

O script cria a estrutura Android oficial apenas se ela estiver ausente, preservando `lib/` e `test/`, instala dependências, analisa, testa e compila. A estrutura Android oficial já está incluída no projeto. O APK de desenvolvimento ficará em `build/app/outputs/flutter-apk/app-debug.apk`. Não é uma versão assinada para distribuição definitiva.

Para executar em um Android conectado: `flutter run`. Um dispositivo ou emulador é necessário para validar instalação e comportamento Android.

## Próximas etapas

1. Validar a base e gerar o primeiro APK.
2. Receitas, despesas, categorias e armazenamento local.
3. Dashboard e relatórios financeiros.
4. Open Finance em sandbox, com provedor escolhido e backend para proteger credenciais. Nunca armazenar segredos do provedor no APK.

Histórico de decisões, erros, prompts e soluções: [relatório de desenvolvimento](docs/RELATORIO_DESENVOLVIMENTO.md).

## Validação desta etapa

Flutter 3.47.7 e Dart 3.13.5. Análise estática aprovada e 1 teste de widget aprovado. APK debug gerado com sucesso em `build/app/outputs/flutter-apk/app-debug.apk`. Instalação em celular físico ainda não validada.

Autor do repositório: **vinivini26**.
