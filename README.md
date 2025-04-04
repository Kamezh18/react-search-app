# 🔍 OpenSearch React Search App

This is a React-based search application that connects to an OpenSearch backend to retrieve and display search results with pagination.

## ✨ Features

- 🔎 Keyword search using OpenSearch `_search` endpoint
- 📄 Pagination (default 3-page window)
- 🔄 Browser back/forward navigation support
- ❌ Clear search with a cancel (`✕`) button
- 🎨 Styled interface with light blue background
- ⚡ Fast client-side navigation with `useEffect` and state updates

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- NPM or Yarn
- A running OpenSearch instance with an index named `my-index`

---

### 🔧 Installation

```bash
git clone https://github.com/your-username/react-search-app.git
cd react-search-app
npm install
