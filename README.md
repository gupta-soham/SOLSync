# 🔄 SOLSync - Solana Token Management Platform

SOLSync is a modern web application for managing Solana tokens, built with Next.js, featuring a neo-brutalist design system and comprehensive token management capabilities. It provides a user-friendly interface for interacting with the Solana blockchain, managing tokens, and performing various token-related operations.

![SOLSync Banner](/public/solsync-banner.png)

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Available Scripts](#-available-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- 🎨 Neo-brutalist design system with responsive UI
- 💰 Token account management and balance tracking
- 🔄 Token creation with metadata support
- 💱 Token swap interface (coming soon)
- 🌐 Support for both Mainnet and Devnet
- 📱 Fully responsive design for all devices
- 🔒 Secure wallet integration with Solana Wallet Adapter
- 🚀 Optimistic updates for a great user experience
- 📡 Modern data fetching using React Query
- 🖼️ Image uploads for token logos
- 💨 Fast and efficient with Next.js App Router

### Account Management

- View SOL balance with real-time updates
- Track SPL token balances
- Request airdrops on Devnet
- One-click wallet address copying
- Direct link to view transactions on Solscan

### Token Creation

- Custom token name and symbol input
- Token metadata with image upload support
- Configurable token decimals (0-9)
- Initial supply setting
- Customizable freeze and mint authority options

### Token Swap (Coming Soon)

- Intuitive token-to-token swap interface
- Adjustable slippage tolerance
- Real-time price impact calculation
- Transparent transaction fee estimation

## 🛠️ Tech Stack

- **Framework**: [Next.js 13+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- **Token Standards**: [SPL Token 2022](https://spl.solana.com/token-2022)
- **Wallet**: [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Metadata Storage**: [Web3.Storage](https://web3.storage/)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have installed:

- Node.js 18 or higher
- pnpm package manager (`npm install -g pnpm`)
- Solana CLI tools (optional, for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/{your-username}/solsync.git
   cd solsync
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_W3_KEY=your_web3_storage_key
   NEXT_PUBLIC_W3_PROOF=your_web3_storage_proof
   NEXT_PUBLIC_FEE_RECIPIENT=your_solana_address
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
├── app/                # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── tabs/           # Tab components
│   └── ui/             # UI components
├── contexts/           # React contexts
├── lib/                # Utility functions
└── public/             # Static assets
```

## 🔧 Available Scripts

- **Development**

  ```bash
  pnpm dev          # Start development server
  pnpm lint         # Run ESLint
  pnpm type-check   # Run TypeScript compiler
  ```

- **Production**
  ```bash
  pnpm build        # Create production build
  pnpm start        # Start production server
  ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

---

Made with ❤️ by [Soham Gupta](https://github.com/gupta-soham)
