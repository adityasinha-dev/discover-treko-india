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

### Provisioning hotel partner accounts

The seven configured hotel partners can be provisioned as approved partner accounts with active dashboard listings using `npm run provision:hotel-partners`. The command connects to the configured MongoDB database and is safe to rerun; it does not change passwords for accounts that already exist. Set the following initial-password environment variables for hotels whose accounts do not yet exist. Use the initial passwords supplied to you and keep them in a local secret manager rather than committing them to the repository:

- `HOTEL_PARTNER_PASSWORD_JP_HILLS`
- `HOTEL_PARTNER_PASSWORD_KAVITA_INN`
- `HOTEL_PARTNER_PASSWORD_OBEROI_CEIL`
- `HOTEL_PARTNER_PASSWORD_ATLAS_PALACE`
- `HOTEL_PARTNER_PASSWORD_SNOW_VALLEY`
- `HOTEL_PARTNER_PASSWORD_HOTEL_VALLEY`
- `HOTEL_PARTNER_PASSWORD_YOG_NIKETAN`

The script reads `MONGODB_URI` from the process environment or the root `.env` file. New passwords are hashed by the existing user model. Existing unrelated accounts or mismatched partner applications are left untouched and reported as errors for manual review.
