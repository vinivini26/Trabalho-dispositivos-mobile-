# Documentação — Trabalho 1: FinTrack

[← Apresentação do FinTrack](../README.md) · [Todos os trabalhos](../../README.md)

| Documento | Para que serve |
| --- | --- |
| [Relatório de desenvolvimento](RELATORIO_DESENVOLVIMENTO.md) | Requisitos, decisões, erros, soluções e resultado da etapa inicial. |

O código fica em [`../lib/`](../lib/) e o teste em [`../test/`](../test/).
A preparação Android fica em [`../scripts/prepare_android.sh`](../scripts/prepare_android.sh).

O FinTrack é a base inicial do aplicativo financeiro. Movimentações, persistência e
Open Finance ainda estão previstos para etapas futuras. Os registros de compilação
no relatório são históricos, com as condições em que foram executados.

Na reorganização do repositório, código, configurações e documentação do FinTrack foram
reunidos em `fintrack/`. Referências à antiga raiz nos registros descrevem a localização
usada na época; os comandos atuais devem ser executados dentro de `fintrack/`.

## Verificação após a mudança de pasta

Em 08/11/2026, dentro de `fintrack/`:

- `flutter pub get --offline`: dependências resolvidas.
- `flutter analyze`: nenhuma ocorrência.
- `flutter test`: 1 teste de interface aprovado.

A movimentação preservou o conteúdo do código e das configurações. O script de preparação
Android também passou na conferência de sintaxe (`bash -n`).
