# Welcome to the CDEWS project!

 CDEWS (Crop Disease Early Warning System) is a full-stack web application built to empower farmers with modern technology. Our platform provides an all-in-one solution for identifying crop diseases, planning cultivation, and connecting with a community of fellow farmers.
 Our mission is to make farming more productive, sustainable, and profitable by putting data-driven tools directly into the hands of the people who feed the world.

# Tech Stack

Frontend: Next.js, React, Tailwind CSS

Backend: Python, FastAPI, PyTorch


# How to Run Locally

1.⁠ ⁠Clone the Repository
First, get the project code from GitHub.

git clone https://github.com/404aryan/c-dews.git
cd c-dews

2.⁠ ⁠Set Up & Run the Backend API
A. Navigate to the Backend Directory & Install Dependencies

cd backend

python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt



 Run the Backend Server
Start the API using Uvicorn. This must be running for the frontend to work.

uvicorn app:app --reload

Check: Your backend should now be running at http://127.0.0.1:8000.

3.⁠ ⁠Set Up & Run the Frontend Application
Open a second, new terminal window for this step.

A. Navigate to the Frontend Directory & Install Dependencies

cd frontend
npm install

B. Run the Frontend Server
This command starts the Next.js user interface.

npm run dev

Check: Your frontend should now be running. Open your browser and go to http://localhost:3000.

You should now have the full CDEWS application running locally!

Our Team (The Collaborators)
Aryan Kumar Gupta
Tanish Singh
Saket Sinha
Yasir Arafat

Thank you for reviewing our project!
