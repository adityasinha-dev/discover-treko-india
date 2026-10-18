Treko – Smart Travel Planning

Treko is a travel planning platform focused on simplifying travel within India by bringing destinations, stays, cab operators, and local guides together in one place.

✨ Features

- 🇮🇳 Explore popular destinations across India
- 🏨 Browse stays and hotels
- 🚕 Explore cab operators
- 🧑‍💼 Discover local guides
- 📦 Select stays, cabs, and guides for a travel package
- 🔐 User Login & Account Creation
- 🤝 Become a Partner

🚀 Live Demo

👉 [View Treko Live Demo](https://discover-treko-india.vercel.app/)


🛠️ Tech Stack

Frontend: React, TypeScript, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB

«Treko is currently being developed as a college project and is continuously evolving.»

## Business partner portal

Partner applications and customer bookings are persisted through the Express/MongoDB API. Configure `.env` from `.env.example`, then start the API with `npm run server` and the web app with `npm run dev`.

Admin sign-in uses the backend-only `ADMIN_ID` and `ADMIN_PASSWORD` environment variables. Open `/admin/login` to authenticate and review applications at `/admin/dashboard`; the admin token is short-lived and stored only in the current browser tab. Admin login is rate-limited. A partner's dashboard is available at `/business-dashboard` only after approval.
