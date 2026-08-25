#!/bin/bash
set -e

echo "🔨 Building Soroban contract..."

cd "$(dirname "$0")/pipa-escrow"

# Build optimizado para WASM
cargo build --target wasm32-unknown-unknown --release

echo "✅ Contract built successfully!"
echo "📦 WASM location: target/wasm32-unknown-unknown/release/pipa_escrow.wasm"
echo ""
echo "📝 To deploy, run: ./deploy.sh"
