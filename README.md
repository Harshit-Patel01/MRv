# MRv – Movie reViewed

A lightweight, self-hosted movie recommendation web app that dynamically scrapes **Netflix™** genre pages in real-time and displays the titles inside an eye-catching, desktop-first carousel UI.

> ⚠️ **Educational use only** – This project scrapes public pages from *netflix.com* for demonstration purposes. It is **not** affiliated with Netflix, Inc. or intended for production use. Use it responsibly and respect the target site's Terms of Service.

---

## ✨ Features

•  Real-time scraping of Netflix genre pages via a Node.js + Express API (no pre-seeded database).
•  Infinite carousel that fetches more titles on-demand.
•  Nine genre shortcuts (Home, Fantasy, Horror, Sci-Fi, Romance, Drama, Action, Thriller, Comedy).
•  Elegant loading screen, keyboard navigation (← / →) and animated progress bar.
•  Responsive About overlay & mobile warning screen.
•  Pure **vanilla** front-end (HTML + CSS + JS) – no heavy frameworks.

---

## 🗂️ Project structure

```
├── MRv.html           # Main web page (front-end)
├── script.js          # Front-end logic (carousel, fetch calls)
├── style.css          # Styling
├── server.js          # Express API that scrapes Netflix
├── package.json       # NPM metadata & scripts
├── assets/            # Static resources (favicon, screenshots, …)
└── .github/           # GitHub workflows (optional)
```

---

## 🚀 Quick start

### Prerequisites

• Node.js ≥ 18

```bash
# 1) Clone & enter the repository
$ git clone https://github.com/<your-user>/MRv.git
$ cd MRv

# 2) Install server dependencies
$ npm install

# 3) Start the scraping API (defaults to PORT 3000)
$ npm start

# 4) Serve the front-end
#    Option A – Open MRv.html directly in your browser (file://) – quickest for testing
#    Option B – Serve it with a simple static server (recommended for CORS-free experience)
$ npx serve .     # or `python -m http.server` etc.

# 5) Browse to http://localhost:5000/MRv.html (or the URL printed by your static server)
```

**Environment variables**

| Variable | Default | Description                    |
|----------|---------|--------------------------------|
| `PORT`   | `3000`  | Port used by the Express API   |

---

## 🔍 How it works

1. The front-end loads and immediately calls `GET /initial?url=<genre_url>` on the local API.
2. `server.js` downloads the given Netflix page with **axios**, parses it using **cheerio**, and extracts up to ten random unique movie/series links.
3. For every link, the server fetches the detail page, grabs the hero image(s) and text description, then returns an array of objects back to the browser.
4. The carousel renders the received items and, when you approach the end, calls `GET /more?count=<n>` to retrieve additional titles – creating the illusion of infinite scrolling.

---

## 🛠️ Development

•  Start the API in watch-mode:

```bash
npm run dev   # uses nodemon
```

•  Linting/formatting is not yet set up – contributions welcome!

---

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b feat/amazing-feature`  
2. Commit your changes: `git commit -m "feat: add amazing feature"`  
3. Push to the branch: `git push origin feat/amazing-feature`  
4. Open a Pull Request.

---

## 📄 License

MIT © 2024 Harshit Singh Patel

---

## 💬 Acknowledgements

• Logo generated with [Leonardo AI](https://leonardo.ai/)  
• Inspired by Netflix's brilliant catalogue and UI/UX. 