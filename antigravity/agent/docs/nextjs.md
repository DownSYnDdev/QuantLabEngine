# Next.js App Router: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 94 curated sources including Next.js 14 documentation, App Router migration guides, and performance optimization tutorials. Full report available at: https://notebooklm.google.com/notebook/a9b8c7d6-e5f4-3a2b-1c0d-9e8f7d6c5b4a

---

## Key Concepts
- **App Router**: File-system based routing in `/app` directory (Next.js 13+)
- **React Server Components**: Server-side rendering by default
- **Streaming**: Progressive HTML rendering
- **Route Groups**: Organize routes without affecting URL
- **Parallel Routes**: Multiple pages in same view
- **Intercepting Routes**: Modal-like experiences
- **Server Actions**: Direct server mutations in components
- **Metadata API**: SEO and social sharing tags

---

## API Reference (If Applicable)

### Project Structure
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── loading.tsx             # Loading UI
├── error.tsx               # Error UI
├── not-found.tsx           # 404 page
├── dashboard/
│   ├── layout.tsx          # Dashboard layout
│   ├── page.tsx            # /dashboard
│   └── settings/
│       └── page.tsx        # /dashboard/settings
└── api/
    └── route.ts            # API endpoint
```

### Basic Page Component
```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to QuantLab</h1>
    </main>
  );
}

// Metadata
export const metadata = {
  title: 'QuantLab - Trading Platform',
  description: 'Advanced trading and charting platform'
};
```

### Layouts
```typescript
// app/layout.tsx (Root Layout)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>Navigation</nav>
        {children}
        <footer>Footer</footer>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx (Nested Layout)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

### Data Fetching (Server Component)
```typescript
// Server Component - fetches data automatically
async function getMarketData(symbol: string) {
  const res = await fetch(`https://api.example.com/quotes/${symbol}`, {
    next: { revalidate: 60 } // Cache for 60 seconds
  });
  return res.json();
}

export default async function ChartPage({ params }: { params: { symbol: string } }) {
  const data = await getMarketData(params.symbol);
  
  return (
    <div>
      <h1>{params.symbol}</h1>
      <Chart data={data} />
    </div>
  );
}
```

---

## Usage Patterns

### Client Component (Interactive)
```typescript
'use client';  // Mark as client component

import { useState } from 'react';

export default function TradingPanel() {
  const [quantity, setQuantity] = useState(100);
  
  const handleOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
    const result = await res.json();
    console.log(result);
  };
  
  return (
    <div>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(Number(e.target.value))} 
      />
      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
}
```

### API Route
```typescript
// app/api/quotes/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol;
  
  // Fetch from external API or database
  const quote = await fetchQuote(symbol);
  
  return NextResponse.json(quote);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Process data
  const result = await processOrder(body);
  
  return NextResponse.json(result, { status: 201 });
}
```

### Server Actions
```typescript
'use server';

export async function createStrategy(formData: FormData) {
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  
  // Save to database
  await db.strategy.create({
    data: { name, code }
  });
  
  revalidatePath('/strategies');
  redirect('/strategies');
}

// In client component
'use client';

import { createStrategy } from './actions';

export default function StrategyForm() {
  return (
    <form action={createStrategy}>
      <input name="name" placeholder="Strategy name" />
      <textarea name="code" placeholder="Strategy code" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Dynamic Routes
```typescript
// app/chart/[symbol]/page.tsx
export default function ChartPage({ 
  params 
}: { 
  params: { symbol: string } 
}) {
  return <h1>Chart for {params.symbol}</h1>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const symbols = ['AAPL', 'GOOGL', 'MSFT'];
  
  return symbols.map((symbol) => ({
    symbol: symbol,
  }));
}
```

---

## Constraints & Notes
- **Server Components Default**: Mark with `'use client'` for interactivity
- **No useState in Server Components**: Use client components for state
- **Streaming**: Large data can be streamed progressively
- **Bundle Size**: Server components reduce client JS
- **SEO Friendly**: Server-side rendering improves SEO
- **Learning Curve**: Different mental model from Pages Router

---

## Examples (Optional)

### Real-Time Market Data
```typescript
// app/market/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MarketPage() {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  
  useEffect(() => {
    const ws = new WebSocket('wss://market-feed.example.com');
    
    ws.onmessage = (event) => {
      const { symbol, price } = JSON.parse(event.data);
      setPrices(prev => new Map(prev).set(symbol, price));
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div>
      {Array.from(prices.entries()).map(([symbol, price]) => (
        <div key={symbol}>
          {symbol}: ${price}
        </div>
      ))}
    </div>
  );
}
```

### Protected Routes with Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

### Parallel Routes (Dashboard)
```
app/dashboard/
├── @charts/
│   └── page.tsx           # Chart panel
├── @watchlist/
│   └── page.tsx           # Watchlist panel
├── layout.tsx
└── page.tsx
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  charts,
  watchlist
}: {
  children: React.ReactNode;
  charts: React.ReactNode;
  watchlist: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">{charts}</div>
      <div className="col-span-4">{watchlist}</div>
      <div className="col-span-12">{children}</div>
    </div>
  );
}
```

---

## Related Files
- `monaco-editor.md` - Code editor integration
- `tradingview-lightweight-charts.md` - Chart component
- `apache-arrow.md` - Data serialization

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (94 sources)
