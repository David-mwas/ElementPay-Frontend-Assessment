#!/usr/bin/env bash
# setup-repo.sh
# Initialize a git repo with small, meaningful commits for review.
# Run from project root after npm install.
set -e
git init
git checkout -b main
git config user.name "Your Name"
git config user.email "you@example.com"

# Commit 1: project config
git add package.json tsconfig.json next.config.js postcss.config.js tailwind.config.js .env.example
git commit -m "chore: project config (next, typescript, tailwind, env.example)"

# Commit 2: basic app shell + layout + globals
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "feat(ui): add app layout, header, and global styles"

# Commit 3: wagmi provider and client lib
git add lib/wagmi.ts
git commit -m "feat(wallet): add wagmi client configuration"

# Commit 4: wallet UI
git add app/wallet/page.tsx components/Button.tsx
git commit -m "feat(wallet): add wallet connect UI (MetaMask + WalletConnect)"

# Commit 5: mock API endpoints
git add app/api/mock/_store.ts app/api/mock/orders/create/route.ts app/api/mock/orders/[order_id]/route.ts app/api/mock/orders/[order_id]/stream/route.ts
git commit -m "feat(api): add mock orders API and SSE stream"

# Commit 6: webhook handler and verification
git add app/api/webhooks/elementpay/route.ts tests/webhook.test.ts
git commit -m "feat(webhooks): add webhook verification handler and tests"

# Commit 7: order page + client polling + SSE handling
git add app/order/page.tsx src/types.ts
git commit -m "feat(order): add order creation page with polling and SSE race handling"

# Commit 8: README and polish
git add README.md
git commit -m "docs: add README with run & webhook instructions"

echo "Repository initialized with commits. Set remote and push:"
echo "  git remote add origin <your-repo-url>"
echo "  git push -u origin main"
