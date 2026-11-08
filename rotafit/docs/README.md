# Documentação — Trabalho 3: RotaFit

[← Apresentação do RotaFit e download do APK](../README.md) · [Todos os trabalhos](../../README.md)

| Documento | Para que serve |
| --- | --- |
| [Relatório de desenvolvimento](RELATORIO_DESENVOLVIMENTO.md) | Escopo, decisões, adaptações do guia, problemas e resultado final. |
| [Testes e exportação](VALIDACAO.txt) | Resultados de tipagem, testes do app e banco, formatação e empacotamento. |
| [Verificações de interface](VALIDACAO_UI.txt) | Cenários e tamanhos de tela conferidos com serviços simulados. |
| [Compilação do APK](VALIDACAO_NATIVA.txt) | Execução aprovada no GitHub, commit compilado e dados do artefato. |
| [Capturas da interface](capturas/README.md) | Índice visual dos temas e das telas verificadas. |

As telas ficam em [`../app/`](../app/), a implementação em [`../src/`](../src/) e
os testes em [`../__tests__/`](../__tests__/). O banco e suas permissões ficam em
[`../supabase/`](../supabase/).

O APK de homologação foi gerado pelo workflow compartilhado em
[`.github/workflows/rotafit-android.yml`](../../.github/workflows/rotafit-android.yml).
O [README do aplicativo](../README.md#apk-pelo-github-actions) contém o download e as instruções.

As capturas usam sessão, backend, GPS e Spotify simulados. A compilação e os testes
automatizados passaram; Google, Spotify e GPS reais ainda precisam de configuração
das contas e homologação em aparelho. Sem variáveis Supabase, o APK abre configuração inicial.

Os registros antigos podem mencionar a organização anterior do repositório. Atualmente,
FinTrack, MarketGo e RotaFit ficam, respectivamente, em `fintrack/`, `marketgo/` e `rotafit/`.
