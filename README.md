# ConvoBench

<p align="center">
  <img src="public/logo.jpg" alt="ConvoBench Logo" width="200" />
</p>

**Voice Agent Paper Hunt** - Curated collection of academic papers on Conversational AI, Voice Agents, Speech LLMs, and Real-time Voice Interaction.

🔗 **Live Site:** [convobench.org](https://convobench.org)

## ✨ Features

- 📚 **25+ Curated Papers** - Landmark research from OpenAI, Google, Meta, Kyutai, Alibaba, and academia
- 💡 **Insights Module** - Key industry metrics and trends at a glance
- 🔍 **Smart Search** - Filter by title, author, abstract, or keywords
- 🏷️ **Tag-based Filtering** - Quick filter by benchmark, LLM, voice-agent, full-duplex, etc.
- 📊 **Citation Sorting** - Sort papers by citations or publication year
- 🌗 **Dual Theme** - Light (Dopamine Geek Style) and Dark mode
- ⭐ **Landmark Badges** - Highlighted influential papers

## 💡 Insights

| Metric | Value | Description |
|--------|-------|-------------|
| **Latency Target** | < 200ms | Industry benchmark for human-like voice interaction |
| **Research History** | 50+ Years | From ELIZA (1966) to GPT-4o (2024) |
| **Next Frontier** | Full-Duplex | Simultaneous listening & speaking (Moshi, GPT-4o) |
| **Architecture Shift** | Speech-Native | End-to-end models replacing cascaded ASR→LLM→TTS |

## 📖 Featured Papers

### Landmark Papers
- **Attention Is All You Need** (2017) - Foundation of Transformer architecture (95K+ citations)
- **Whisper** (2023) - Robust multilingual ASR from OpenAI (2.1K+ citations)
- **Google Duplex** (2018) - Human-level phone conversations (1.2K+ citations)
- **GPT-4o** (2024) - 232ms audio latency, native multimodality
- **Moshi** (2024) - Open-source full-duplex speech model from Kyutai

### Speech-Native Models
- **GLM-4-Voice** - End-to-end Chinese voice model (Zhipu AI)
- **Qwen2-Audio** - General audio perception beyond speech (Alibaba)
- **SALMONN** - Generic hearing abilities for LLMs
- **AudioPaLM** - Speech-to-speech with PaLM-2 (Google)
- **LLaMA-Omni** - Low-latency speech interaction

### Benchmarks
- **SUPERB** - Speech processing universal benchmark
- **VocalBench** - Vocal conversational abilities
- **DialogBench** - Human-like dialogue evaluation
- **MT-Bench** - Multi-turn conversation benchmark
- **Chatbot Arena** - Human preference evaluation

## 🎨 Design

ConvoBench features **Dopamine Geek Style**:

- Cream background with floating gradient decorations
- Premium cards with glow effects on hover
- Gradient stat cards (Blue → Purple → Pink → Orange)
- Outfit typography for modern, readable text
- Custom logo with voice waveform design

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Domain**: convobench.org

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Coowoolf/convobench.git
cd convobench

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🤝 Contributing

Missing a paper? Want to add new research?

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
  arxivId: "2401.00000",  // or use `link` for non-arXiv
  tags: ["benchmark", "voice-agent", "LLM"],
  abstract: "Brief description...",
  citations: 100,
  highlight: false  // true for landmark papers
}
```

## 📄 License

MIT License

---

Built with ❤️ for the Voice Agent community.

© 2026 ConvoBench
