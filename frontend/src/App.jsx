import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import StudentContent from './pages/StudentContent'
import StudentAI from './pages/StudentAI'
import StudentQuizzes from './pages/StudentQuizzes'
import Layout from './components/Layout'

function PrivateRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to={user.role==='teacher'?'/teacher':'/student'} />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teacher" element={<PrivateRoute role="teacher"><Layout><Outlet /></Layout></PrivateRoute>}>
          <Route index element={<TeacherDashboard />} />
        </Route>
        <Route path="/student" element={<PrivateRoute role="student"><Layout><Outlet /></Layout></PrivateRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="content" element={<StudentContent />} />
          <Route path="content/:subject" element={<StudentContent />} />
          <Route path="ai" element={<StudentAI />} />
          <Route path="quizzes" element={<StudentQuizzes />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
export default App
