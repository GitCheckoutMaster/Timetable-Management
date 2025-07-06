/* eslint-disable no-unused-vars */
import "./DayCalendarStyle.css";
import { useEffect, useState } from "react";
import TaskCard from "../TaskCard/TaskCard.jsx";

const DayCalendar = ({ selectedDate, tasks }) => {
	const today = new Date();
	let width = 0;
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

	useEffect(() => {
		currentTasks.sort((a, b) => {
			return new Date(a.session_start_time) - new Date(b.session_start_time);
		});
	}, [currentTasks])

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
					{
						currentTasks?.map((task, idx, arr) => {
							const prevTask = idx > 0 ? arr[idx - 1] : null;
							const prevTaskEndTime = prevTask ? new Date(prevTask.session_end_time) : null;
							const endTime = new Date(task.session_end_time);
							const startTime = new Date(task.session_start_time);

							if (prevTaskEndTime && prevTaskEndTime > startTime) {
								width += 100;
								return (
									<TaskCard key={task.id} taskDetails={task} widthOffset={width} />
								)
							} else {
								width = 0;
							}

							return (
								<TaskCard
									key={task.id}
									taskDetails={task}
									widthOffset={width}
								/>
						  )
						})
					}
					{[...Array(24)].map((_, hour) => {
						return (
							<tr key={hour} className="inactive-hour">
								<td>
								</td>
							</tr>
						);
					})}
				</table>
			</div>
		</div>
	);
};

export default DayCalendar;
