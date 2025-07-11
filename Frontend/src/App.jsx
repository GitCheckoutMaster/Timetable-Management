import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Home from './pages/Home/Home.jsx';
import DayCalendar from './components/DayCalendar/DayCalendar.jsx';
import WeekCalendar from './components/WeekCalendar/WeekCalendar.jsx';
import MonthCalendar from './components/MonthCalendar/MonthCalendar.jsx';
import RegisterTrainer from './components/RegisterTrainer/RegisterTrainer.jsx';
import Session from './components/SessionManagement/Session.jsx';
import PastSessions from './components/PastSessions/PastSessions.jsx';
import ResetPassword from './pages/ResetPassword/ResetPassword.jsx';
import AddBatch from './components/AddBatch/AddBatch.jsx';
import RemoveBatch from './components/RemoveBatch/RemoveBatch.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to={"/home/day-view"} />} />
        <Route path='/home' element={<Home />}>
          <Route path='day-view' element={<DayCalendar />} />
          <Route path='week-view' element={<WeekCalendar />} />
          <Route path='month-view' element={<MonthCalendar />} />
          <Route path='register-trainer' element={<RegisterTrainer />} />
          <Route path='session' element={<Session />} />
          <Route path='past-sessions' element={<PastSessions />} />
          <Route path='add-batch' element={<AddBatch />} />
          <Route path='remove-batch' element={<RemoveBatch />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
