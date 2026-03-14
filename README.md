# YouTube View Tracker

A real-time web application that tracks the live view counts of any YouTube video. The system fetches views every minute and dynamically updates a live dashboard featuring charts and data tables to help you visualize the growth of a video over time.

## 🚀 Features

- **Real-Time Tracking:** Automatically tracks YouTube video views every minute.
- **Live Dashboard:** Instant updates pushed to the connected clients via WebSockets.
- **Interactive Charts:** Visualizes view count growth over time using beautiful charts.
- **Historical Data:** Stores tracked data persistently so you can review view histories.

## 🛠️ Tech Stack

**Frontend:**
- [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/) for interactive graphs
- [Socket.io-client](https://socket.io/) for real-time WebSocket communication
- [Axios](https://axios-http.com/) for API requests

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/) for pushing live updates to the frontend
- [SQLite3](https://www.sqlite.org/) for lightweight, persistent data storage
- [Axios](https://axios-http.com/) for fetching data from the YouTube API

## 📋 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- A valid [YouTube Data API v3 Key](https://developers.google.com/youtube/v3/getting-started)

## ⚙️ Setup & Installation

Follow these steps to get the project up and running locally.

### 1. Backend Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Copy the example environment variable file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open the newly created `.env` file and add your YouTube API key:
   ```env
   YOUTUBE_API_KEY=your_api_key_here
   ```
4. Install the backend dependencies:
   ```bash
   npm install
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Use

1. Once both the frontend and backend are running, open your browser and navigate to `http://localhost:5173`.
2. Paste a valid YouTube video URL into the input field.
3. Click on the tracking button to start monitoring.
4. The application will fetch the view count every minute and update the chart and table automatically.

## 📄 License

This project is open-source and free to use.
