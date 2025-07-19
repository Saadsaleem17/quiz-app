# QuizMaster - MongoDB Integration

## 🎯 **MongoDB Storage Now Active!**

Your quiz app is now using **MongoDB Atlas** for persistent data storage instead of localStorage. All user accounts, quizzes, and results are stored in the cloud!

## 🚀 **How to Run with MongoDB**

### **1. Start Backend Server (MongoDB API)**
```bash
npm run server
```
This starts the Express server on port 3001 that connects to MongoDB Atlas.

### **2. Start Frontend (React App)**  
```bash
npm start
```
This starts the React app on port 3000.

### **3. Run Both Together**
```bash
npm run dev
```
This runs both frontend and backend simultaneously.

## 🗄️ **Current Data Storage**

- **Database**: MongoDB Atlas Cloud Database
- **Connection**: `mongodb+srv://saadsaleem17oct:mmsMijMD1g9r1uyM@cluster0.xwdy0te.mongodb.net/quiz-app`
- **Collections**: 
  - `users` - User accounts and authentication
  - `quizzes` - Quiz data with questions and metadata
  - `quizresults` - Quiz completion results and scores

## 🔐 **Features**

- **Secure User Authentication**: Each user has a unique account
- **Persistent Data**: Quizzes survive browser restarts, computer restarts, and device changes
- **Real-time Storage**: All changes are immediately saved to MongoDB
- **Global Access**: Access your quizzes from any device with your username
- **Automatic Backups**: MongoDB Atlas provides automatic backups

## 🔧 **Environment Configuration**

Current settings in `.env`:
```
REACT_APP_DEMO_MODE=false          # Uses MongoDB API
REACT_APP_API_URL=http://localhost:3001/api
MONGODB_URI=mongodb+srv://...       # MongoDB connection string
```

## 📊 **API Endpoints**

- `POST /api/users/signup` - Create new user account
- `POST /api/users/login` - Login existing user
- `GET /api/quizzes/user/:userId` - Get user's quizzes
- `POST /api/quizzes` - Save new quiz
- `DELETE /api/quizzes/:quizId` - Delete quiz
- `PATCH /api/quizzes/:quizId/usage` - Update quiz usage stats
- `GET /api/health` - Check server status

## 🎮 **User Experience**

1. **Sign Up**: Create a unique username (stored in MongoDB)
2. **Login**: Access your account from any device
3. **Create Quizzes**: Quizzes are automatically saved to the cloud
4. **Access Anywhere**: Your quiz library is available from any device
5. **No Data Loss**: All data is safely stored in MongoDB Atlas

Your quiz app is now production-ready with cloud database storage!
