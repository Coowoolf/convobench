# ConvoBench

**Voice Agent Paper Hunt** - Curated collection of academic papers on Conversational AI, Voice Agents, Speech LLMs, and Real-time Voice Interaction.

🔗 **Live Site:** [convobench.org](https://convobench.org)

![ConvoBench Screenshot](https://via.placeholder.com/800x400/0a0a0f/5B9FFF?text=ConvoBench)

## ✨ Features

- 📚 **20+ Curated Papers** - Landmark research from OpenAI, Google, Meta, and academia
- 🔍 **Smart Search** - Filter by title, author, abstract, or keywords
- 🏷️ **Tag-based Filtering** - Quick filter by benchmark, LLM, voice-agent, real-time, etc.
- 📊 **Citation Sorting** - Sort papers by citations or publication year
- 🌗 **Dual Theme** - Dark mode (default) and Light mode (Dopamine Geek Style)
- ⭐ **Landmark Badges** - Highlighted influential papers (Whisper, GPT-4o, Google Duplex)

## 📖 Featured Papers

### Landmark Papers
- **Whisper** - Robust Speech Recognition via Large-Scale Weak Supervision (OpenAI, 2100+ citations)
- **Google Duplex** - AI System for Real-World Phone Tasks (Google, 1250+ citations)
- **GPT-4o** - Omni-Modal Foundation Model with 232ms audio latency (OpenAI)

### Benchmarks
- **SUPERB** - Speech Processing Universal PERformance Benchmark
- **VocalBench** - Benchmarking Vocal Conversational Abilities
- **DialogBench** - Evaluating LLMs as Human-like Dialogue Systems
- **MT-Bench** - Multi-Turn Benchmark for LLM Conversation
- **VoiceAgentEval** - Evaluating LLMs for Expert-Level Outbound Calling

### Speech Language Models
- **Moshi** - Full-Duplex Speech-to-Speech Model (Kyutai Labs)
- **LLaMA-Omni** - Seamless Speech Interaction with LLMs
- **SeamlessM4T** - Multilingual & Multimodal Translation (Meta)

## 🎨 Design

ConvoBench features a **Dopamine Geek Style** visual system:

- **Light Mode**: Cream background (#F5F3EF), Claymorphism cards, soft shadows
- **Dark Mode**: Deep dark background (#0a0a0f), Glass-morphism cards
- **Dopamine Gradients**: Blue → Purple → Pink → Orange color palette
- **Floating Decorations**: Animated gradient spheres

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: CSS Variables + Custom Components
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Domain**: convobench.org

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Coowoolf/convobench.git

# Navigate to project
cd convobench

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🤝 Contributing

Missing a paper? Want to add a new benchmark?

1. Fork the repository
2. Add your paper to the `papers` array in `src/app/page.tsx`
3. Submit a Pull Request

### Paper Format

```typescript
{
  id: "unique-id",
  title: "Paper Title",
  authors: "Author Names",
  venue: "Conference/Journal",
  year: 2024,
  arxivId: "2401.00000",  // or use `link` for non-arXiv papers
  tags: ["benchmark", "voice-agent", "LLM"],
  abstract: "Brief description of the paper...",
  citations: 100,
  highlight: false  // Set to true for landmark papers
}
```

## 📋 Roadmap

- [ ] Paper submission form
- [ ] User authentication
- [ ] Paper upvoting system
- [ ] RSS feed for new papers
- [ ] Email notifications
- [ ] Citation graph visualization

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for the Voice Agent community.

© 2024 ConvoBench
