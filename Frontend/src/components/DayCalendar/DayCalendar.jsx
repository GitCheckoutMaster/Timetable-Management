/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./DayCalendarStyle.css";

const DayCalendar = ({ selectedDate, tasks }) => {
	const today = new Date();
	const [minutesOfCurrentDay, setMinutesOfCurrentDay] = useState(
		today.getHours() * 60 + today.getMinutes()
	);
	const [currentTasks, setCurrentTasks] = useState([]);
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const monthName = monthNames[selectedDate.getMonth().toString()];
	const linePos = (minutesOfCurrentDay / 60) * 80.8;

	useEffect(() => {
		const timer = setInterval(() => {
			setMinutesOfCurrentDay(
				new Date().getHours() * 60 + new Date().getMinutes()
			);
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		
		const updatedTasks = tasks.filter((task) => {
			const taskDate = new Date(task.session_date);
			return taskDate.getDate() == selectedDate.getDate() && taskDate.getMonth() == selectedDate.getMonth() && taskDate.getFullYear() == selectedDate.getFullYear();
		})

		setCurrentTasks(updatedTasks);
	}, [selectedDate, tasks]);

	return (
		<div className="day-calendar">
			<div className="day-calendar-header">
				<h2>{selectedDate.getDate().toString()}</h2>
				<h3>{monthName}</h3>
			</div>
			<div className="day-calendar-container">
				{today.getDate() === selectedDate.getDate() && (
					<div
						className="current-time-line"
						style={{ top: `${linePos}px` }}
					></div>
				)}

				<table className="day-hours">
					{[...Array(23)].map((_, hour) => {
						return (
							<tr key={hour + 1} className="day-hour">
								{hour + 1 < 12
									? `${hour + 1} AM`
									: hour + 1 === 12
									? "12 PM"
									: `${hour + 1 - 12} PM`}
							</tr>
						);
					})}
				</table>
				<table className="day-calendar-table">
					{[...Array(24)].map((_, hour) => {
						return (
							<tr key={hour} className="inactive-hour">
								<td></td>
							</tr>
						);
					})}
				</table>
			</div>
		</div>
	);
};

export default DayCalendar;
