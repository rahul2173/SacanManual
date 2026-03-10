# ScanManual 🔍

ScanManual is a state-of-the-art Next.js application that leverages Gemini 3 AI to instantly identify physical products from a camera feed, retrieve official user manuals, and provide an interactive AI chat assistant for real-time product support.

## ✨ Features

- **Instant Visual Identification**: Point your camera at any product for high-precision naming and categorization via Gemini Vision.
- **Automated Manual Discovery**: Instantly retrieves official PDF manuals or support pages using Google Search grounding.
- **AI Product Expert**: Context-aware chat assistant that knows your product's manual inside out.
- **Multimodal Support**: Listen to manual summaries via integrated Text-to-Speech.
- **Enterprise Ready**: Includes global error boundaries, offline detection, and session timeout management.
- **Privacy First**: Stateless architecture with NO database or authentication required.

## 🚀 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Engine**: [Google Gemini 3 (Fast Preview)](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A Google AI (Gemini) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/scan-manual.git
   cd scan-manual
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   Add your `GEMINI_API_KEY` to `.env.local`.

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add your `GEMINI_API_KEY` to the Vercel Project Settings -> Environment Variables.
4. Deploy!

## 🛡️ Security & Quality

- **Production Audit**: Systematically audited for OWASP compliance and performance.
- **Error Handling**: Comprehensive input validation and resilient AI streaming.
- **Diagnostics**: Health check route available at `/api/health`.

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
