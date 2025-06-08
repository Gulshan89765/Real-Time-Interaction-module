 # Real-Time Polling Application

A real-time polling application built with HTML, CSS, JavaScript, and Socket.IO. Users can create polls and vote on them, with results updating in real-time for all connected users.

## Features

- Create polls with multiple options
- Real-time vote updates
- Responsive design
- Progress bars showing vote percentages
- Add unlimited poll options

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the files
2. Open a terminal in the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Create a new poll:
   - Enter your question
   - Add at least 2 options
   - Click "Add Option" to add more options
   - Click "Create Poll" to publish

2. Vote on polls:
   - Click on any option to cast your vote
   - See results update in real-time
   - Progress bars show the percentage of votes for each option

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Socket.IO for real-time communication
- Express.js for the server
- Node.js runtime

## Note

This is a basic implementation that stores polls in memory. In a production environment, you would want to:
- Add a database for persistent storage
- Implement user authentication
- Add input validation and sanitization
- Add rate limiting
- Implement proper error handling 
