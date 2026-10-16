import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fintrack/main.dart';

void main() {
  testWidgets('mostra estado inicial sem simular conexão bancária', (
    tester,
  ) async {
    await tester.pumpWidget(const FinTrackApp());
    expect(find.text('FinTrack'), findsOneWidget);
    expect(find.text('R\$ 0,00'), findsOneWidget);
    expect(find.text('Nenhuma movimentação cadastrada.'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Open Finance'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(
      find.textContaining('Nenhuma conta bancária conectada'),
      findsOneWidget,
    );
    expect(tester.takeException(), isNull);
  });
}
