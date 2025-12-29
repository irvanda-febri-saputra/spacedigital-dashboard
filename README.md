# SpaceDigital Dashboard

Dashboard untuk mengelola bot Telegram dan payment gateway.

## Tech Stack

- **React 18** + Vite
- **React Router v6** - Routing
- **Tailwind CSS** - Styling (Neobrutalism design)
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:8000/api
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Folder Structure

```
src/
├── components/       # Reusable components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Layout.jsx
│   ├── Icons.jsx
│   └── Skeleton.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Bots.jsx
│   ├── Transactions.jsx
│   └── PaymentGateways.jsx
├── services/        # API services
│   ├── api.js
│   ├── authService.js
│   ├── botService.js
│   └── transactionService.js
├── store/           # Zustand stores
│   └── authStore.js
├── lib/             # Utilities
│   └── utils.js
├── App.jsx          # Router setup
├── main.jsx         # Entry point
└── index.css        # Tailwind + custom styles
```

## Features

- ✅ Authentication (Login/Logout)
- ✅ Dashboard overview
- ✅ Bot management
- ✅ Transaction history
- ✅ Payment gateway configuration
- ✅ Responsive design
- ✅ Dark/Light mode ready
