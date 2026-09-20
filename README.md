# Virtual Assistant

A full-stack AI-powered virtual assistant application with a React frontend and an Express backend. Users can sign up, sign in, customize their assistant profile, and interact with a personalized assistant experience.

## Features

- User authentication with signup, signin, and logout
- Customizable assistant profile and settings
- React frontend with Vite and Tailwind CSS
- Express backend with MongoDB integration
- Secure cookie-based authentication
- Image/media support using Cloudinary
- AI integration using Groq SDK

## Project Structure

```text
Virtual-Assistant/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── FrontEnd/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT-based auth (via token utility)
- bcryptjs for password hashing
- Cloudinary for media handling
- Groq SDK for AI capabilities

## Prerequisites

Before running the project, make sure you have:

- Node.js (v18 or later recommended)
- npm or yarn
- MongoDB instance or MongoDB Atlas connection string
- A Groq API key
- Cloudinary account credentials

## Environment Variables

Create a `.env` file inside the `Backend` folder with the following variables:

```env
PORT=8000
FRONTEND_URL=http://localhost:5173
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
COOKIE_SAMESITE=strict
COOKIE_SECURE=false
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/khilesh321/Virtual-Assistant.git
cd Virtual-Assistant
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../FrontEnd
npm install
```

### 4. Run the Backend

```bash
cd Backend
npm run dev
```

The backend server will start on the port defined in `.env` (default: `8000`).

### 5. Run the Frontend

```bash
cd FrontEnd
npm run dev
```

The frontend will start with Vite, typically on:

```text
http://localhost:5173
```

## Authentication Flow

The backend exposes authentication routes for:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/logout`

The app stores a secure HTTP-only cookie for authentication and uses password hashing with `bcryptjs`.

## Usage

1. Open the frontend in the browser.
2. Create an account or sign in.
3. Customize the assistant profile.
4. Start using the virtual assistant experience.

## Notes

- The frontend route logic checks whether assistant details are already configured before allowing access to the main app.
- The backend uses MongoDB for persistent user storage.
- Adjust the CORS origin in the backend configuration if your frontend runs on a different URL.

## License

This project is licensed under the ISC License.

## Author

Khilesh Jawale

## Repository

https://github.com/khilesh321/Virtual-Assistant
