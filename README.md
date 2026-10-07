# MERN Form Builder

A Google-Forms-style application built with MongoDB, Express, React and Node.js.

## Features
- Register/login with JWT in httpOnly cookie
- Create, edit, publish and delete forms
- Sections and questions
- Question types: short answer, long answer, email, number, multiple choice, checkboxes, dropdown, date, rating
- Owner/editor/viewer permissions
- Public share link for responders
- Submit responses without login
- Owner response dashboard
- Socket.IO foundation for real-time events
- Responsive React UI

## Backend
```bash
cd server
npm install
copy .env.example .env
npm run dev
```

## Frontend
```bash
cd client
npm install
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:5173

Set `CLIENT_URL` and `VITE_API_URL` in the environment files if your ports differ.
