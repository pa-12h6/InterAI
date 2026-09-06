InterAI - AI-Powered Interview Preparation Platform

InterAI is an AI-powered mock interview platform that helps users practice interviews, receive AI-based feedback, and track their interview performance.

Features

- AI-generated interview questions
- Job role selection
- Experience level selection
- Difficulty level selection
- AI-based answer evaluation
- Correctness score
- Technical quality score
- Communication score
- Overall interview score
- 10-minute interview timer
- Question navigation
- Interview result storage
- Interview summary
- Performance tracking

Tech Stack

Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router

Backend

- Node.js
- Express.js

Database

- MongoDB

AI

- AI API

How It Works

1. Select your job role.
2. Select your experience level.
3. Select the interview difficulty.
4. Start the AI mock interview.
5. Answer the generated questions.
6. Submit your answers for AI evaluation.
7. Receive scores and personalized feedback.
8. Complete the interview and view your overall score.
9. Review your performance.

Project Structure

InterAI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md

Installation

1. Clone the Repository

git clone https://github.com/YOUR-USERNAME/InterAI-AI-Interview-Preparation.git

2. Open the Project

cd InterAI-AI-Interview-Preparation

3. Install Backend Dependencies

cd backend
npm install

4. Install Frontend Dependencies

Open another terminal:

cd frontend
npm install

Environment Variables

Create a ".env" file inside the backend folder.

Example:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_api_key
JWT_SECRET=your_secret_key

Do not upload the ".env" file to GitHub.

The actual API keys and database credentials should remain private.

Running the Project Locally

Start Backend

cd backend
npm start

The backend will run on:

http://localhost:5000

Start Frontend

Open another terminal:

cd frontend
npm start

The frontend will run on:

http://localhost:3000

Interview Flow

Select Role
     ↓
Select Experience
     ↓
Select Difficulty
     ↓
Generate AI Questions
     ↓
Answer Questions
     ↓
AI Evaluation
     ↓
Score & Feedback
     ↓
Complete Interview
     ↓
View Performance

Future Improvements

- Voice-based interview
- Resume-based interview questions
- Real-time interview mode
- Advanced performance analytics
- Interview history comparison
- Personalized preparation recommendations

Author

Pallavi Joge

Computer Science and Data Science Student

Links

GitHub: Add your GitHub repository link here

Live Demo: Add your deployed Vercel link here