# Estate Liquidation — Mobile App

React Native app for estate liquidation field workers. Photograph items during a property walkthrough and get AI-powered inventory entries via Claude vision API.

## Prerequisites

- **Node.js v20** — recommended to install via [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows)
- **Expo Go** on your iPhone — download from the App Store
- Your computer and iPhone on the **same WiFi network**
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

1. Clone the repo:
```bash
git clone https://github.com/YOUR_USERNAME/estate-liquidation.git
cd estate-liquidation/mobile
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create your `.env` file:
```bash
cp .env.example .env
```

Add your Anthropic API key to `.env`:

EXPO_PUBLIC_ANTHROPIC_API_KEY=your-api-key-here

4. Start the app:
```bash
npx expo start --clear
```

5. Scan the QR code with your iPhone camera to open in Expo Go.

## Troubleshooting

**npm install fails** — always use `--legacy-peer-deps` flag.

**App not loading on phone** — make sure both devices are on the same WiFi network.

**Analysis failing** — check your `.env` has a valid Anthropic API key with available credits.