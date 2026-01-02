# 🚀 Moonlight Web - Quick Start

## Start Backend (Rust)

```bash
./start-backend.sh
```

Backend will run on: **http://localhost:8080**

---

## Start Frontend (Next.js)

```bash
./start-frontend.sh
```

Frontend will run on: **http://localhost:3000**

---

## Manual Commands

### Backend
```bash
cd moonlight-web/web-server
source $HOME/.cargo/env
../../target/release/web-server
```

### Frontend
```bash
cd moonlight-web/nextjs-frontend
npm run dev
```

---

## Rebuild Backend (if needed)

```bash
source $HOME/.cargo/env
cargo build --release
```

---

## Both Servers Running

You need **both** servers running:
- **Backend** (port 8080) - API + WebSocket
- **Frontend** (port 3000) - Next.js UI

Open http://localhost:3000 in your browser to use the app.


Install Rust 
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

load env variables
source $HOME/.cargo/env

Install rust nightly
rustup toolchain install nightly

set default to nightly
rustup override set nightly