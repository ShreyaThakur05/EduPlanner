# EduPlanner Pro - Student Academic Planner

A comprehensive web-based student planner application that helps students manage their academic life through intelligent tracking, planning, and organization.

## 🚀 Features

### Core Features
- **Dashboard Overview**: Centralized view of all academic activities with real-time statistics
- **Schedule Management**: Visual timetable with current/next class display and course management
- **Assignment Tracker**: Create, manage, and track assignments with status updates and filtering
- **Grade Management**: Record and track grades with edit/delete functionality
- **Notes Repository**: Create, organize, and search study materials with file attachments
- **Faculty Directory**: Manage faculty contact information with subject mapping
- **Profile Settings**: Personalized user profiles with image upload and data persistence

### Advanced Features
- **Real-time Data Sync**: All changes reflect immediately across the dashboard
- **Smart Filtering**: Filter assignments by status (pending, in-progress, completed, overdue)
- **Search Functionality**: Search notes by title, content, course, or tags
- **File Attachments**: Support for PDF, DOC, PPT, images in notes
- **Data Persistence**: All data saved locally and persists across sessions
- **Responsive Design**: Mobile-friendly interface with gradient styling
- **CRUD Operations**: Full create, read, update, delete functionality for all items

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling and gradients
- **React Router** for navigation
- **Heroicons** for consistent iconography
- **LocalStorage** for data persistence
- **File API** for image and file uploads

### Features Implementation
- **Mock Authentication** for demo purposes
- **Local Data Storage** with user-specific keys
- **Real-time Updates** across all components
- **Form Validation** and error handling
- **Responsive Grid Layouts** for all sections

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ShreyaThakur05/EduPlanner.git
cd EduPlanner-Pro
```

### 2. Install Dependencies
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install
```

### 3. Start Development Server
```bash
# Start the React development server
npm start

# The application will open at http://localhost:3000
```

### 4. First Time Setup
1. **Register**: Create a new account with your name and email
2. **Add Data**: Start adding courses, assignments, grades, and notes
3. **Explore**: All data is saved locally and persists across sessions

## 🚀 Production Build

```bash
# Create production build
npm run build

# Serve the build (optional)
npm install -g serve
serve -s build
```

## 📱 Usage Guide

### Getting Started
1. **Register**: Create account with your actual name and email
2. **Dashboard**: View overview of all your academic data
3. **Schedule**: Add courses with days, times, and locations
4. **Assignments**: Create and track homework with due dates and priorities
5. **Grades**: Record test/assignment scores and track performance
6. **Notes**: Create study notes with file attachments and tags
7. **Faculty**: Add faculty contact information by subject
8. **Profile**: Customize your profile with photo and personal details

### Key Features
- **Real-time Updates**: Dashboard reflects all changes immediately
- **Search & Filter**: Find assignments by status, search notes by content
- **Edit & Delete**: Modify or remove any item with dedicated buttons
- **File Uploads**: Attach files to notes and upload profile pictures
- **Data Persistence**: All information saved locally and restored on login

## 🔐 Data & Security

- **Local Storage**: All data stored in browser's localStorage
- **User-specific Data**: Each user's data is isolated by user ID
- **File Handling**: Secure file uploads with type validation
- **Mock Authentication**: Demo-friendly authentication system
- **Data Persistence**: Information survives browser refresh and logout/login

## 📊 Application Structure

### Main Sections
- **Dashboard** (`/dashboard`) - Overview with statistics and current/next classes
- **Schedule** (`/schedule`) - Course timetable management
- **Assignments** (`/assignments`) - Assignment tracking with status management
- **Grades** (`/grades`) - Grade recording and management
- **Notes** (`/notes`) - Note creation with search and file attachments
- **Faculty** (`/faculty`) - Faculty contact directory
- **Profile** (`/profile`) - User profile and settings

### Data Management
- All data stored in `localStorage` with user-specific keys
- Real-time synchronization across all components
- Automatic save on all create/update/delete operations

## 🧪 Testing

```bash
# Run React tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@eduplannerPro.com
- **Discord**: Join our community server

## 🗺️ Current Features Status

### ✅ Completed Features
- [x] User registration and authentication
- [x] Dashboard with real-time statistics
- [x] Schedule management with visual grid
- [x] Assignment tracking with status filtering
- [x] Grade management with edit/delete
- [x] Notes with search and file attachments
- [x] Faculty contact directory
- [x] Profile settings with image upload
- [x] Data persistence across sessions
- [x] Responsive design with gradients
- [x] Full CRUD operations for all items

### 🚀 Future Enhancements
- [ ] Backend API integration
- [ ] Cloud data synchronization
- [ ] Advanced analytics and reporting
- [ ] Calendar integration
- [ ] Mobile app version
- [ ] Collaborative features

## 📈 Performance

- **Load Time**: Fast initial load with React optimization
- **Data Storage**: Efficient localStorage management
- **Real-time Updates**: Instant UI updates on data changes
- **Responsive Design**: Optimized for all device sizes
- **Local Processing**: No server dependencies for core functionality

## 🌟 Acknowledgments

- Icons by [Heroicons](https://heroicons.com/)
- UI Components inspired by [Tailwind UI](https://tailwindui.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Email templates by [MJML](https://mjml.io/)

---

**Made with ❤️ for students worldwide**