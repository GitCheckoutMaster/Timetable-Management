/* eslint-disable no-unused-vars */
import "./DayCalendarStyle.css";
import { useEffect, useState } from "react";
import TaskCard from "../TaskCard/TaskCard.jsx";
import { useOutletContext } from "react-router-dom";

const DayCalendar = () => {
	const { selectedDate, tasks } = useOutletContext();
	const today = new Date();
	let width = 0;
	const [minutesOfCurrentDay, setMinutesOfCurrentDay] = useState(
		today.getHours() * 60 + today.getMinutes()
	);
	const [currentTasks, setCurrentTasks] = useState([]);
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const monthName = monthNames[selectedDate?.getMonth().toString()];
	const linePos = (minutesOfCurrentDay / 60) * 70;

	useEffect(() => {
		const timer = setInterval(() => {
			setMinutesOfCurrentDay(
				new Date().getHours() * 60 + new Date().getMinutes()
			);
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const updatedTasks = tasks?.filter((task) => {
			const taskDate = new Date(task.session_date);

			const isSameDate =
				taskDate.getDate() === selectedDate.getDate() &&
				taskDate.getMonth() === selectedDate.getMonth() &&
				taskDate.getFullYear() === selectedDate.getFullYear();

			const isDailyRepeat = task.repeat_on === "daily";

			const isWeeklyRepeat =
				task.repeat_on === "weekly" &&
				taskDate.getDay() === selectedDate.getDay();

			const isMonthlyRepeat =
				task.repeat_on === "monthly" &&
				taskDate.getDate() === selectedDate.getDate();

			return isSameDate || isDailyRepeat || isWeeklyRepeat || isMonthlyRepeat;
		});

		setCurrentTasks(updatedTasks);
	}, [selectedDate, tasks]);

	useEffect(() => {
		currentTasks?.sort((a, b) => {
			return new Date(a.session_start_time) - new Date(b.session_start_time);
		});
	}, [currentTasks]);

	const isBeforeDate = (d1, d2) => {
		return (
			d1.getFullYear() < d2.getFullYear() ||
			(d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() < d2.getMonth()) ||
			(d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() === d2.getMonth() &&
				d1.getDate() < d2.getDate())
		);
	};

	const isAfterDate = (d1, d2) => {
		if (!d1 || !d2) return false;
		return (
			d1.getFullYear() > d2.getFullYear() ||
			(d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() > d2.getMonth()) ||
			(d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() === d2.getMonth() &&
				d1.getDate() > d2.getDate())
		);
	}

	return (
		<div className="day-calendar">
			<div className="day-calendar-header">
				<h2>{selectedDate?.getDate().toString()}</h2>
				<h3>{monthName}</h3>
			</div>
			<div className="day-calendar-container">
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
					{today.getDate() === selectedDate?.getDate() && (
						<div
							className="current-time-line"
							style={{ top: `${linePos}px` }}
						></div>
					)}

					{currentTasks?.map((task, idx, arr) => {
						const prevTask = idx > 0 ? arr[idx - 1] : null;
						const prevTaskEndTime = prevTask
							? new Date(prevTask.session_end_time)
							: null;
						const startTime = new Date(task.session_start_time);
						const endTime = new Date(task.repeat_end);

						if (prevTaskEndTime && prevTaskEndTime > startTime) {
							width += 100;
							return (
								<TaskCard
									key={task.id}
									taskDetails={task}
									widthOffset={width}
									viewWidth={930}
								/>
							);
						} else {
							width = 0;
						}
						if (isBeforeDate(selectedDate, startTime) && task.repeat_on != "none") {
							return null;
						}
						if (isAfterDate(selectedDate, endTime) && task.repeat_on != "none") {
							return null;
						}

						return (
							<TaskCard
								key={task.id}
								taskDetails={task}
								widthOffset={width}
								viewWidth={930}
							/>
						);
					})}
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
