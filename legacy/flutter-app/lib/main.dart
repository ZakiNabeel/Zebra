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
      title: 'Zebra Studio',
      debugShowCheckedModeBanner: false, // <-- THIS REMOVES THE DEBUG STICKER
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6200EA)), // A nicer deep purple
        useMaterial3: true,
        fontFamily: 'Roboto', // Cleaner default font
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
  final String modelPath = r'C:\Users\zakin\Documents\Zebra\models\phi-3-mini-4k-instruct-q4_k_m.gguf';
  
  LlamaParent? _llamaParent;
  final TextEditingController _promptController = TextEditingController(text: "Write a short story about Ronaldo and Messi playing soccer on the moon.");
  
  String _generatedText = "Initializing offline AI engine... Please wait.";
  bool _isGenerating = false;
  bool _isModelLoaded = false;

  @override
  void initState() {
    super.initState();
    _initializeModel();
  }

  Future<void> _initializeModel() async {
    try {
      final loadCommand = LlamaLoad(
        path: modelPath,
        modelParams: ModelParams(),
        contextParams: ContextParams(),
        samplingParams: SamplerParams(),
      );
      
      _llamaParent = LlamaParent(loadCommand);
      await _llamaParent!.init();
      
      setState(() {
        _isModelLoaded = true;
        _generatedText = "Model loaded successfully. Ready to generate!";
      });
      
      _llamaParent!.stream.listen((token) {
        setState(() {
          _generatedText += token;
        });
      });

      _llamaParent!.completions.listen((event) {
        setState(() {
          _isGenerating = false;
        });
      });
      
    } catch (e) {
      setState(() {
        _generatedText = "Error: $e\n\n(If you see llama_log_set here, the package downgrade didn't take effect yet!)";
      });
    }
  }

  void _generateStory() {
    if (!_isModelLoaded || _promptController.text.isEmpty || _llamaParent == null) return;

    setState(() {
      _isGenerating = true;
      _generatedText = "";
    });

    String prompt = "<|system|>\nYou are a friendly storyteller for children.<|end|>\n<|user|>\n${_promptController.text}<|end|>\n<|assistant|>\n";
    _llamaParent!.sendPrompt(prompt);
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
      backgroundColor: const Color(0xFFF8F9FA), // Off-white background
      appBar: AppBar(
        title: const Text('Zebra Studio (Parent Mode)', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: true,
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800), // Keeps it looking good on wide desktop screens
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Story Prompt",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _promptController,
                  decoration: InputDecoration(
                    hintText: 'What should the story be about?',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF6200EA), width: 2),
                    ),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _isGenerating || !_isModelLoaded ? null : _generateStory,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6200EA),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 2,
                    ),
                    child: Text(
                      _isGenerating ? 'Generating Offline...' : 'Generate Story',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: SingleChildScrollView(
                      child: Text(
                        _generatedText,
                        style: const TextStyle(fontSize: 16, height: 1.6, color: Colors.black87),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}