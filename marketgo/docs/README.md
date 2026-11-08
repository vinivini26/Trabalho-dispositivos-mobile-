# Documentação — Trabalho 2: MarketGo

[← Apresentação do MarketGo](../README.md) · [Todos os trabalhos](../../README.md)

| Documento | Para que serve |
| --- | --- |
| [Relatório em Markdown](RELATORIO_DESENVOLVIMENTO.md) | Decisões de implementação, erros, correções e limites da validação. |
| [Relatório em PDF](RELATORIO_DESENVOLVIMENTO.pdf) | Versão de apresentação do relatório da entrega original. |
| [Resultados de testes](VALIDACAO.txt) | Logs registrados de tipagem, testes do app/banco e exportação Android. |

As telas ficam em [`../app/`](../app/), a implementação em [`../src/`](../src/) e
os testes do app em [`../__tests__/`](../__tests__/). Os arquivos do banco são
[`schema.sql`](../supabase/schema.sql), [`seed.sql`](../supabase/seed.sql) e
os [testes locais](../supabase/tests/).

Para executar, configure um Supabase próprio seguindo o README do projeto. Pagamentos
e avanço do status de entrega são de demonstração. Os logs não comprovam instalação
em celular ou homologação com um backend real configurado.

Esta pasta documenta apenas o MarketGo. O FinTrack tem [documentação própria](../../fintrack/docs/README.md).
O PDF mantém o registro da entrega original; o README do projeto e este índice mostram
os caminhos atuais após a reorganização.
