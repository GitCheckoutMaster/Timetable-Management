/* eslint-disable no-unused-vars */
import "./WeekCalendarStyle.css";
import { useEffect, useState } from "react";
import TaskCard from "../TaskCard/TaskCard.jsx";
import { useOutletContext } from "react-router-dom";
import { set } from "react-hook-form";


function formatDateTimeLocal(date) {
	return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:00`;
}


const WeekCalendar = () => {
	const { selectedDate, tasks } = useOutletContext();
	const [selectedWeek, setSelectedWeek] = useState([]);
	const [currentTasks, setCurrentTasks] = useState([]);
	const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const today = new Date();
	let width = 0;
	const [minutesOfCurrentDay, setMinutesOfCurrentDay] = useState(
		today.getHours() * 60 + today.getMinutes()
	);

	// Helpers
	const getDatesBetween = (startDate, endDate) => {
		const dates = [];
		const currentDate = new Date(startDate);
		currentDate.setHours(0, 0, 0, 0);
		endDate.setHours(0, 0, 0, 0);

		while (currentDate <= endDate) {
			dates.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dates;
	};

	const formatDate = (date) => {
		const pad = (n) => (n < 10 ? "0" + n : n);
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)}`;
	};

	// Calculate week days
	useEffect(() => {
		const day = selectedDate?.getDay();
		const date = selectedDate?.getDate();
		const month = selectedDate?.getMonth();
		const year = selectedDate?.getFullYear();

		const startOfWeek = new Date(year, month, date - day);
		setSelectedWeek(
			Array.from({ length: 7 }, (_, i) => {
				const currentDate = new Date(startOfWeek);
				currentDate.setDate(startOfWeek.getDate() + i);
				return currentDate;
			})
		);
	}, [selectedDate]);

	// Filter & generate tasks for this week
	useEffect(() => {
		if (!tasks || tasks.length === 0) {
			setCurrentTasks([]);
			return;
		} 

		const validTasks = tasks.filter((task) => {
			const taskDate = new Date(task.session_date);
			return selectedWeek.some(date => {
				return (
					taskDate.getDate() === date.getDate() &&
					taskDate.getMonth() === date.getMonth() &&
					taskDate.getFullYear() === date.getFullYear()
				);
			})
		});

		setCurrentTasks(validTasks);
	}, [tasks, selectedWeek, selectedDate]);

	// Live line
	const linePos = minutesOfCurrentDay * 1.17;
	useEffect(() => {
		const timer = setInterval(() => {
			setMinutesOfCurrentDay(
				new Date().getHours() * 60 + new Date().getMinutes()
			);
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="week-calendar">
			<div className="week-calendar-header">
				<div className="week-calendar-hours-header"></div>
				<div className="week-calendar-days-header">
					{selectedWeek.map((date, index) => (
						<div key={index} className="week-calendar-heading">
							<h2
								className={
									new Date().getDate() === date.getDate() &&
									new Date().getMonth() === date.getMonth() &&
									new Date().getFullYear() === date.getFullYear()
										? "active-date"
										: ""
								}
							>
								{date.getDate()}
							</h2>
							<h3>{shortWeekDays[date.getDay()]}</h3>
						</div>
					))}
				</div>
			</div>

			<div className="week-calendar-body">
				<div className="week-calendar-hours">
					{[...Array(23)].map((_, hour) => (
						<div key={hour} className="week-hour">
							{hour + 1 < 12
								? `${hour + 1} AM`
								: hour + 1 === 12
								? "12 PM"
								: `${hour + 1 - 12} PM`}
						</div>
					))}
				</div>

				<div className="week-calendar-table-container">
					<table className="week-calendar-table">
						{selectedWeek.find(
							(date) =>
								date.getDate() === new Date().getDate() &&
								date.getMonth() === new Date().getMonth() &&
								date.getFullYear() === new Date().getFullYear()
						) && (
							<div
								className="week-current-time-line"
								style={{
									top: `${linePos}px`,
									left: `${(new Date().getDay() * 100) / 7}%`,
									width: `${100 / 7}%`,
								}}
							></div>
						)}
						{currentTasks?.map((task) => {
							// console.log("Rendering task:", {
							// 	id: task.id,
							// 	date: task.session_date,
							// 	start: task.session_start_time,
							// });
							return (
								<TaskCard
									key={task.id}
									taskDetails={task}
									widthOffset={width}
									viewWidth={133.8}
									selectedDate={selectedDate}
								/>
							);
						})}

						{[...Array(24)].map((_, hour) => (
							<tr key={hour} className="inactive-hour">
								{selectedWeek.map((_, index) => (
									<td key={index}></td>
								))}
							</tr>
						))}
					</table>
				</div>
			</div>
		</div>
	);
};

export default WeekCalendar;
