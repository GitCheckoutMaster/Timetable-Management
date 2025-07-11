import { useEffect, useState } from "react";
import "./MonthCalendarStyle.css";
import TaskCard from "../TaskCard/TaskCard";
import { useOutletContext } from "react-router-dom";

const MonthCalendar = () => {
	const { selectedDate, tasks } = useOutletContext();
	const [selectedMonths, setSelectedMonths] = useState([]);
	const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const user = JSON.parse(localStorage.getItem("user")) || {};
	const shortMonthDays = [
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
	const [filteredTasks, setFilteredTasks] = useState([]);

	useEffect(() => {
		// Generate 5 week grid starting from the start of this calendar view
		const month = selectedDate?.getMonth();
		const year = selectedDate?.getFullYear();

		const startOfMonth = new Date(year, month, 1);
		const endOfMonth = new Date(year, month + 1, 0);

		if (startOfMonth.getDay() !== 0) {
			startOfMonth.setDate(startOfMonth.getDate() - startOfMonth.getDay());
		}
		if (endOfMonth.getDay() !== 6) {
			endOfMonth.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));
		}

		setSelectedMonths(
			Array.from({ length: 35 }, (_, i) => {
				const currentDate = new Date(startOfMonth);
				currentDate.setDate(startOfMonth.getDate() + i);
				return currentDate;
			})
		);
	}, [selectedDate]);

	// Just store all tasks for filtering in render
	useEffect(() => {
		setFilteredTasks(tasks);
	}, [tasks]);

	const isToday = (date) => {
		const now = new Date();
		return (
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		);
	};
	return (
		<div className="month-calendar">
			<div className="month-calendar-header">
				{shortWeekDays.map((day, index) => (
					<div key={index} className="month-calendar-heading">
						<h3>{day}</h3>
					</div>
				))}
			</div>
			<div className="month-calendar-body">
				<table className="month-calendar-table">
					{Array.from({ length: 5 }, (_, rowIndex) => (
						<tr key={rowIndex}>
							{selectedMonths
								.slice(rowIndex * 7, rowIndex * 7 + 7)
								.map((date, index) => (
									<td
										key={index}
										className={`${date.getDate() === 1 ? "new-month" : ""} ${
											isToday(date) ? "today" : ""
										}`}
									>
										<div className="day-cell">
											<div className="day-number">
												{date.getDate()}
												{date.getDate() === 1 && (
													<span className="month-tag">
														{shortMonthDays[date.getMonth()]}
													</span>
												)}
											</div>

											{filteredTasks
												?.filter((task) => {
													const taskDate = new Date(task.session_date);
													return (
														taskDate.getFullYear() === date.getFullYear() &&
														taskDate.getMonth() === date.getMonth() &&
														taskDate.getDate() === date.getDate()
													) && (user.id === task.trainer_id || user.admin == 1);
												})
												.map((task) => (
													<TaskCard
														key={task.id}
														taskDetails={task}
														widthOffset={0}
														viewWidth={0}
													/>
												))}
										</div>
									</td>
								))}
						</tr>
					))}
				</table>
			</div>
		</div>
	);
};

export default MonthCalendar;
