import 'package:flutter/material.dart';
import 'package:llama_cpp_dart/llama_cpp_dart.dart';

void main() {
  runApp(const ZebraApp());
}

class ZebraApp extends StatelessWidget {
  const ZebraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zebra Edge AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const EdgeAIHomeScreen(),
    );
  }
}

class EdgeAIHomeScreen extends StatefulWidget {
  const EdgeAIHomeScreen({super.key});

  @override
  State<EdgeAIHomeScreen> createState() => _EdgeAIHomeScreenState();
}

class _EdgeAIHomeScreenState extends State<EdgeAIHomeScreen> {
  // Your model path remains the same
  final String modelPath = r'C:\Users\zakin\Documents\Zebra\models\phi-3-mini-4k-instruct-q4_k_m.gguf';
  
  LlamaParent? _llamaParent;
  final TextEditingController _promptController = TextEditingController(text: "Write a short story about a brave dog.");
  
  String _generatedText = "Initializing AI engine in background isolate... Please wait.";
  bool _isGenerating = false;
  bool _isModelLoaded = false;

  @override
  void initState() {
    super.initState();
    _initializeModel();
  }

  Future<void> _initializeModel() async {
    try {
      // The new API explicitly defines the load configuration
      final loadCommand = LlamaLoad(
              path: modelPath,
              modelParams: ModelParams(),
              contextParams: ContextParams(),
              samplingParams: SamplerParams(),
            );
      
      // Initialize the engine in a separate thread so it doesn't freeze the UI
      _llamaParent = LlamaParent(loadCommand);
      await _llamaParent!.init();
      
      setState(() {
        _isModelLoaded = true;
        _generatedText = "Edge AI model loaded successfully. Ready.";
      });
      
      // Listen to the token stream as the AI types
      _llamaParent!.stream.listen((token) {
        setState(() {
          _generatedText += token;
        });
      });

      // Listen for the AI to finish generating
      _llamaParent!.completions.listen((event) {
        setState(() {
          _isGenerating = false;
        });
      });
      
    } catch (e) {
      setState(() {
        _generatedText = "CRITICAL ERROR loading model: $e";
      });
    }
  }

  void _generateStory() {
    if (!_isModelLoaded || _promptController.text.isEmpty || _llamaParent == null) return;

    setState(() {
      _isGenerating = true;
      _generatedText = "";
    });

    // The new trigger command
    _llamaParent!.sendPrompt(_promptController.text);
  }

  @override
  void dispose() {
    _llamaParent?.dispose();
    _promptController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Zebra Edge AI Skeleton')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _promptController,
              decoration: const InputDecoration(
                labelText: 'Parent Prompt',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isGenerating || !_isModelLoaded ? null : _generateStory,
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
              child: Text(_isGenerating ? 'Generating...' : 'Generate Offline Story'),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    _generatedText,
                    style: const TextStyle(fontSize: 16, height: 1.5),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}