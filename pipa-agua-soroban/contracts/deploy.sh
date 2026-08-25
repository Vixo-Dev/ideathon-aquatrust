#!/bin/bash
set -e

echo "🚀 Deploying to Stellar Testnet..."
echo ""

# Verificar que existe la identidad admin
if ! soroban keys show admin 2>/dev/null; then
    echo "⚠️  Admin identity not found. Creating one..."
    soroban keys generate admin --network testnet
    
    # Fondear cuenta
    echo "💰 Funding admin account..."
    ADMIN_ADDR=$(soroban keys address admin)
    curl -s "https://friendbot.stellar.org?addr=$ADMIN_ADDR" > /dev/null
    echo "✅ Admin account funded: $ADMIN_ADDR"
    sleep 3
fi

# Deploy del contrato
echo ""
echo "📤 Deploying contract..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm pipa-escrow/target/wasm32-unknown-unknown/release/pipa_escrow.wasm \
  --source admin \
  --network testnet 2>&1 | tail -1)

echo "✅ Contract deployed!"
echo "📋 Contract ID: $CONTRACT_ID"

# Guardar en archivos
echo "$CONTRACT_ID" > contract-id.txt
echo "CONTRACT_ID=$CONTRACT_ID" > .env

# Inicializar contrato
echo ""
echo "🔧 Initializing contract..."
ADMIN_ADDRESS=$(soroban keys address admin)

soroban contract invoke \
  --id "$CONTRACT_ID" \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS"

echo ""
echo "✅ Contract initialized with admin: $ADMIN_ADDRESS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Contract ID: $CONTRACT_ID"
echo "📝 Saved to: contract-id.txt and .env"
echo ""
echo "🔑 Identities created:"
echo "   Admin: $(soroban keys address admin)"
echo ""
echo "📌 Next steps:"
echo "   1. Copy CONTRACT_ID to backend/.env"
echo "   2. Copy CONTRACT_ID to frontend/.env"
echo "   3. Create test identities: soroban keys generate cliente --network testnet"
echo "   4. Fund them: curl \"https://friendbot.stellar.org?addr=\$(soroban keys address cliente)\""
echo ""
