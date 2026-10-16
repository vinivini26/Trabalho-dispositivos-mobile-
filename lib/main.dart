import 'package:flutter/material.dart';

void main() => runApp(const FinTrackApp());

class FinTrackApp extends StatelessWidget {
  const FinTrackApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'FinTrack',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF087F5B)),
      useMaterial3: true,
    ),
    home: const HomePage(),
  );
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('FinTrack')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Seu dinheiro, com clareza.',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Saldo registrado'),
                  SizedBox(height: 8),
                  Text('R\$ 0,00', style: TextStyle(fontSize: 32)),
                  SizedBox(height: 8),
                  Text('Nenhuma movimentação cadastrada.'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Primeiros passos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const ListTile(
            leading: Icon(Icons.account_balance_wallet_outlined),
            title: Text('Receitas e despesas'),
            subtitle: Text('Cadastro e armazenamento local na próxima etapa.'),
          ),
          const ListTile(
            leading: Icon(Icons.lock_outline),
            title: Text('Open Finance'),
            subtitle: Text(
              'Integração planejada. Nenhuma conta bancária conectada.',
            ),
          ),
        ],
      ),
    ),
  );
}
