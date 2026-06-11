import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// Make sure this matches the package name in your pubspec.yaml
import 'package:app/main.dart'; 

void main() {
  testWidgets('Zebra Studio smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame using your actual class name.
    await tester.pumpWidget(const ZebraApp());

    // Verify that our app title rendered correctly on the screen.
    expect(find.text('Zebra Studio (Parent Mode)'), findsOneWidget);

    // Verify that our generate button is present.
    expect(find.text('Generate Story'), findsOneWidget);
  });
}