# Aditya University Campus Assistant

A React and Express chatbot for Aditya University. It provides university information through a local retrieval-augmented generation (RAG) engine and includes student, guest, and admin views.

## Features

- University chatbot for admissions, departments, faculty, placements, scholarships, events, regulations, facilities, hostels, and transport
- Student academic information such as CGPA and attendance
- Guest access for general university information
- Admin query forwarding and replies
- Searchable campus data endpoints
- Optional Gemini AI responses when `GEMINI_API_KEY` is configured
- Dark and light themes

## Requirements

- Node.js 18 or newer
- npm

## Install

```powershell
npm install
```

## Run Locally

Start both the frontend and backend with:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

The services use these ports:

- Frontend: `5173` (Vite)
- Backend: `3001` (Express)

Keep the `npm run dev` terminal running while using the chatbot. Running only `npm run client` starts the frontend without the API and causes `Failed to fetch` errors.

## Demo Access

Select **Guest Login** for general university information.

For personal academic information, use a demo student account:

| Student | Email | Password |
| --- | --- | --- |
| Aarav Reddy | `aarav.reddy@aditya.ac.in` | `Aarav@2026` |
| Ananya Sharma | `ananya.sharma@aditya.ac.in` | `Ananya@2026` |

For the full set of demo accounts, see `src/components/AuthScreen.jsx`.

The demo admin account is:

- Email: `admin@aditya.ac.in`
- Password: `Aditya@2026`

These credentials are for local demonstration only and must be replaced by real authentication before production use.

## Environment Variables

Create a `.env` file in the project root to enable Gemini responses:

```env
GEMINI_API_KEY=your_api_key_here
```

Without this key, the application uses the built-in local RAG engine.

## Commands

```powershell
npm run dev      # Start frontend and backend
npm run client   # Start Vite frontend only
npm run server   # Start Express backend only
npm run build    # Build the frontend for production
npm run preview  # Preview the production build
npm test         # Run chatbot and RAG tests
```

## API Checks

Check backend status:

```powershell
Invoke-RestMethod http://localhost:3001/api/status
```

Send a chat request:

```powershell
$body = @{ query = 'What is the highest placement package?'; role = 'guest' } | ConvertTo-Json
Invoke-RestMethod http://localhost:3001/api/chat -Method Post -ContentType 'application/json' -Body $body
```

## Project Structure

```text
src/                  React frontend
src/components/       Chatbot, authentication, dashboard, and feature components
server/server.js      Express API server
server/services/      Local RAG engine
server/data/          University knowledge base
public/               Static assets
```

## Troubleshooting

### `Failed to fetch` or `Unable to reach the server backend`

Make sure the backend is running on port `3001`:

```powershell
npm run dev
```

Then verify it directly:

```powershell
Invoke-RestMethod http://localhost:3001/api/status
```

If another process is using port `3001`, stop it or set a different `PORT` in `.env` and update the Vite proxy target in `vite.config.js`.
