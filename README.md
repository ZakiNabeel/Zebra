# 🦓 Zebra
**A democratized, highly secure children's content creation platform powered by Hybrid AI.**

Zebra empowers parents to curate, generate, and monitor personalized interactive stories for their children. By utilizing a zero-API-cost Hybrid AI architecture, Zebra ensures absolute data privacy, real-time safety monitoring, and a frictionless experience across all devices.

---

## 🏗️ The Hybrid AI Architecture
Zebra eliminates reliance on commercial AI APIs (like OpenAI or Anthropic) to keep operational costs at zero while maximizing user privacy. 

The system relies on a two-pronged approach:
1. **Edge AI (On-Device):** We deploy lightweight, quantized Small Language Models (SLMs) directly on the user's device. This handles all text generation, NLP tasks, and real-time safety guardrails with zero latency and full offline capability.
2. **Self-Hosted Cloud GPU:** For compute-heavy tasks like generating cartoon-style storybook illustrations, the app communicates asynchronously with a dedicated, self-hosted GPU running optimized open-source models (e.g., fine-tuned Stable Diffusion).

## ✨ Core Features
* **Strict Role-Based Access:** A PIN-protected Parent Dashboard for content generation and a locked-down, visual "Kiosk Mode" for the Child's reading experience.
* **Granular Content Curation:** Parents review, edit, and approve all AI-generated text and imagery before it ever reaches the child's library.
* **Offline Synchronization:** A robust local-first database architecture ensures stories can be read and interacted with even without an internet connection, syncing quietly when connectivity is restored.
* **Democratized Access:** Built to run smoothly on Web, Desktop, iOS, Android, and older family tablets.

## 🗂️ Documentation
Complete system sequence diagrams, use cases, and architectural blueprints can be found in the `docs/` directory.
* [Module 1: Identity & Access Management (IAM)](./docs/architecture/)
* [Module 2: Core Hybrid AI Engine](./docs/architecture/)
* [Product Requirements & Use Cases](./docs/product/)

## 🚀 Getting Started
*(Instructions for local deployment, setting up the `.env` file, and spinning up the self-hosted GPU environment will be added here as the codebase matures).*

---
*Developed under the MIT License. See `LICENSE` for more information.*