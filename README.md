# Pinduoduo Desktop Scraper

Professional desktop application for scraping product data from Pinduoduo mobile web.

## Features

- Embedded mobile browser with real Pinduoduo experience
- Product extraction engine
- Variant/color image collector
- Description image collector
- Network request interception
- SQLite local database
- Laravel API synchronization
- Anti-bot protection

## Tech Stack

- Electron - Desktop application framework
- React + Tailwind - Frontend UI
- Puppeteer - Browser automation
- SQLite - Local database
- Zustand - State management

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Project Structure

```
├── electron/          # Main process code
│   ├── main/         # Main entry point
│   ├── preload/     # Preload scripts
│   ├── ipc/         # IPC handlers
│   └── scraper/     # Scraper modules
│       ├── browser/  # Browser manager
│       ├── extractors/ # Data extractors
│       ├── variants/ # Variant extractor
│       ├── description/ # Description extractor
│       ├── downloads/ # Download manager
│       ├── network/  # Network interceptor
│       └── anti-bot/ # Anti-bot protection
├── renderer/        # React frontend
│   ├── components/ # UI components
│   ├── pages/      # Page components
│   ├── layouts/    # Layout components
│   └── store/      # Zustand store
├── database/       # SQLite database
├── api/           # Laravel API sync
├── storage/       # Downloaded files
└── config/       # Configuration