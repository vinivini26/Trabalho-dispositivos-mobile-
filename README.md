# vinivini26 — Projetos de Dispositivos Móveis

Este repositório reúne **três aplicativos independentes** da disciplina. Cada projeto
tem sua própria pasta, código, testes, configurações e documentação.

## Escolha o trabalho que deseja avaliar

| Trabalho | Aplicativo e objetivo | Tecnologia | Comece aqui | Documentação |
| --- | --- | --- | --- | --- |
| **1** | **FinTrack** — finanças pessoais | Flutter / Dart | [Abrir FinTrack](fintrack/README.md) | [Relatório e estrutura](fintrack/docs/README.md) |
| **2** | **MarketGo** — compras com entrega | React Native / Expo | [Abrir MarketGo](marketgo/README.md) | [Relatório e testes](marketgo/docs/README.md) |
| **3** | **RotaFit** — corrida com GPS e Spotify | React Native / Expo | [Abrir RotaFit](rotafit/README.md) | [Relatório, testes e capturas](rotafit/docs/README.md) |

## Como o repositório está organizado

```text
.
├── README.md               este índice dos três trabalhos
├── .gitignore              arquivos locais comuns que não entram no Git
├── .github/workflows/      automação de testes e geração do APK do RotaFit
├── fintrack/               TRABALHO 1: aplicativo Flutter
│   ├── README.md           apresentação e instruções
│   ├── lib/                código do aplicativo
│   ├── test/               teste de interface
│   ├── android/            configuração nativa Android
│   ├── scripts/            preparação e compilação
│   └── docs/               documentação exclusiva do FinTrack
├── marketgo/               TRABALHO 2: aplicativo de compras
│   ├── README.md           apresentação e instruções
│   ├── app/                telas e navegação
│   ├── src/                componentes, regras e acesso aos serviços
│   ├── __tests__/          testes do aplicativo
│   ├── supabase/           banco, catálogo inicial e testes do banco
│   └── docs/               documentação exclusiva do MarketGo
└── rotafit/                TRABALHO 3: aplicativo de corrida
    ├── README.md           apresentação, execução e acesso ao APK
    ├── app/                telas e navegação
    ├── src/                componentes, GPS, regras e integrações
    ├── __tests__/          testes do aplicativo
    ├── supabase/           banco e testes do banco
    ├── scripts/            verificações de interface
    └── docs/               documentação e capturas exclusivas do RotaFit
```

Os arquivos de dependências e configuração ficam dentro da pasta do respectivo app:
`pubspec.yaml` no FinTrack e `package.json`, `app.json` e `tsconfig.json` nos projetos Expo.
Não existe um aplicativo único para executar pela raiz.

## Roteiro para professores e supervisores

1. Abra o **README do trabalho** na tabela acima para entender objetivo, funcionalidades e execução.
2. Consulte **Documentação** para acessar o relatório, os resultados de testes e os limites da entrega.
3. Examine o código e os testes dentro da mesma pasta. Não é necessário procurar em outra branch.

| Trabalho | Estado da entrega |
| --- | --- |
| FinTrack | Base inicial de interface. Cadastro de movimentações, persistência e Open Finance estão planejados. |
| MarketGo | Fluxo de compras implementado, com testes registrados. Pagamentos e avanço de entrega são de demonstração; o Supabase precisa ser configurado. |
| RotaFit | Aplicativo implementado, testes e APK de homologação aprovados no GitHub. Google, Spotify e GPS em aparelho ainda precisam de homologação real. |

## Executar ou testar

Entre primeiro na pasta do aplicativo escolhido. Consulte o README dele para instalar
as ferramentas, configurar serviços e compilar:

| Trabalho | Entrar na pasta | Verificação principal |
| --- | --- | --- |
| FinTrack | `cd fintrack` | `flutter analyze` e `flutter test` |
| MarketGo | `cd marketgo` | `npm ci`, `npm run typecheck` e `npm test` |
| RotaFit | `cd rotafit` | `npm ci`, `npm run typecheck` e `npm test` |

A automação compartilhada em [`.github/workflows/rotafit-android.yml`](.github/workflows/rotafit-android.yml)
pertence ao RotaFit. As instruções e o link de download do APK estão no
[README do RotaFit](rotafit/README.md#apk-pelo-github-actions).

Autor do repositório: **[vinivini26](https://github.com/vinivini26)**.
