# PushPilot - GitHub Push Scheduler 🚀

**PushPilot** is a full-stack application that allows you to schedule GitHub repository pushes at specific dates and times. Perfect for maintaining consistent contribution activity and automating your Git workflow.

---

## 🎯 Features

- **Add Local Repositories**: Connect your local Git repositories to the scheduler
- **Branch Selection**: Choose which branch to push
- **Date & Time Scheduling**: Pick exact date and time for automatic pushes
- **Dashboard View**: Monitor all scheduled pushes in a clean, modern UI
- **Automatic Execution**: Pushes execute automatically at scheduled times
- **Edit & Cancel**: Modify or remove scheduled pushes as needed

---

## 🏗️ Project Structure

```
PushPilot/
 ├─ frontend/                # React + Tailwind CSS
 │   ├─ src/
 │   │   ├─ components/      # Reusable UI components
 │   │   │   ├─ AddRepoForm.jsx
 │   │   │   ├─ RepoCard.jsx
 │   │   │   ├─ Notification.jsx
 │   │   │   └─ Navbar.jsx
 │   │   ├─ pages/           # Page components
 │   │   │   ├─ Dashboard.jsx
 │   │   │   └─ AddSchedule.jsx
 │   │   ├─ App.js           # Main app with routing
 │   │   └─ index.css        # Tailwind CSS entry
 │   └─ package.json
 ├─ backend/                 # Node.js + Express (To be implemented)
 ├─ scheduler/               # Cron job scripts (To be implemented)
 ├─ database/                # SQLite/JSON storage (To be implemented)
 └─ README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/PushPilot.git
   cd PushPilot
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

---

## 🛠️ Technology Stack

### Frontend

- **React** - UI library
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

### Backend (Coming Soon)

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **node-cron / node-schedule** - Task scheduling
- **SQLite** - Database for storing schedules

---

## 📋 Current Status

### ✅ Completed

- [x] Frontend project structure
- [x] React components with Tailwind CSS styling
- [x] Dashboard page with mock data
- [x] Add Schedule page with form validation
- [x] Routing setup
- [x] Responsive design

### 🚧 To Be Implemented

- [ ] Backend API (Express.js)
- [ ] Database integration (SQLite)
- [ ] Scheduler automation (node-cron)
- [ ] API endpoints (POST /schedule, GET /schedule, DELETE /schedule/:id)
- [ ] Git push execution logic
- [ ] Error handling and notifications
- [ ] Edit schedule functionality
- [ ] Push history log
- [ ] Desktop notifications

---

## 🎨 UI Preview

The application features:

- **Modern Gradient Design** - Blue to indigo color scheme
- **Responsive Layout** - Works on desktop and mobile
- **Interactive Cards** - Hover effects and smooth transitions
- **Real-time Notifications** - Success, error, warning, and info alerts
- **Statistics Dashboard** - View scheduled, completed, and pending pushes

---

## 🔧 Development Workflow

### Adding New Components

```bash
# Create component in src/components/
# Follow the existing pattern with Tailwind CSS classes
```

### Connecting to Backend (Next Steps)

1. Create backend folder with Express server
2. Set up API endpoints
3. Implement node-cron for scheduling
4. Update frontend components to call backend APIs

---

## 📝 API Design (Planned)

### Endpoints

**POST** `/api/schedule`

- Create a new push schedule
- Body: `{ repoPath, branch, pushTime }`

**GET** `/api/schedule`

- Fetch all scheduled pushes

**DELETE** `/api/schedule/:id`

- Cancel a scheduled push

**PUT** `/api/schedule/:id`

- Update an existing schedule

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ by **Your Name**

---

## 🎯 Next Steps

1. **Backend Development**: Set up Express server and API endpoints
2. **Database Setup**: Implement SQLite for persistent storage
3. **Scheduler Logic**: Integrate node-cron for automatic push execution
4. **Testing**: Add unit and integration tests
5. **Deployment**: Deploy backend and frontend to cloud platforms

---

**Happy Scheduling! 🚀**
