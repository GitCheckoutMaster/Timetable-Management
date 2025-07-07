/* eslint-disable no-unused-vars */
import "./HomeStyle.css";
import Header from "../../components/Header/Header";

/* https://www.npmjs.com/package/react-calendar to refer this tool */
import Calendar from "react-calendar";
import './../../../node_modules/react-calendar/dist/Calendar.css';
import DayCalendar from "../../components/DayCalendar/DayCalendar";
import { useEffect, useState } from "react";
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar";
import MonthCalendar from "../../components/MonthCalendar/MonthCalendar";
import { useNavigate } from "react-router-dom";
import { getAllTasks } from "../../api.js";

const Home = () => {

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("day");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => (async () => {
    try {
      const tasks = await getAllTasks();
      if (tasks) {
        // console.log("Tasks fetched successfully:", tasks);
        setTasks(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }), []);

	return (
		<div className="home-container">
      <Header setView={setView} view={view} />
      <div className="calendar-container">
        <div className="sidebar">
          <h2 className="user-name">{user?.name}</h2>
          <Calendar onChange={setSelectedDate} value={selectedDate} />
        </div>
        <div className="calendar">
          {view == "day" && <DayCalendar selectedDate={selectedDate} tasks={tasks} />}
          {view == "week" && <WeekCalendar selectedDate={selectedDate} tasks={tasks} />}
          {view == "month" && <MonthCalendar selectedDate={selectedDate} tasks={tasks} />} 
        </div>
      </div>
    </div>
	);
};

export default Home;
