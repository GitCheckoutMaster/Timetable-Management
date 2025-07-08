/* eslint-disable no-unused-vars */
import "./WeekCalendarStyle.css";
import { useEffect, useState } from "react";
import TaskCard from "../TaskCard/TaskCard.jsx";
import { useOutletContext } from "react-router-dom";

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

	// Filter tasks for this week
	useEffect(() => {
		let updatedTasks = tasks?.filter((task) => {
			const taskDate = new Date(task.session_date);

			return selectedWeek.some((date) => {
				const isSameDate =
					date.getDate() === taskDate.getDate() &&
					date.getMonth() === taskDate.getMonth() &&
					date.getFullYear() === taskDate.getFullYear();

				const isWeeklyRepeat =
					task.repeat_on === "weekly" && date.getDay() === taskDate.getDay();

				const isMonthlyRepeat =
					task.repeat_on === "monthly" && date.getDate() === taskDate.getDate();

				return (
					isSameDate ||
					task.repeat_on === "daily" ||
					isWeeklyRepeat ||
					isMonthlyRepeat
				);
			});
		});

		const dailyTasks = tasks?.filter((task) => task.repeat_on === "daily");

		updatedTasks = updatedTasks?.filter((task) => task.repeat_on !== "daily");

		console.log("Updated Tasks:", updatedTasks);

		const totalDailyTasksThisWeek = dailyTasks?.map((task) => {
			return selectedWeek.map((date) => {
				const newTask = { ...task };
				newTask.session_date = date.toISOString().split("T")[0];
				newTask.session_start_time = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					task.session_start_time.split(" ")[1].split(":")[0],
					task.session_start_time.split(" ")[1].split(":")[1]
				).toISOString();
				newTask.session_end_time = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					task.session_end_time.split(" ")[1].split(":")[0],
					task.session_end_time.split(" ")[1].split(":")[1]
				).toISOString();
				return newTask;
			});
		});

		const flatDailyTasks = totalDailyTasksThisWeek?.flat() || [];
		const combinedTasks = [...(updatedTasks || []), ...flatDailyTasks];

		setCurrentTasks(
			combinedTasks?.sort(
				(a, b) =>
					new Date(a.session_start_time) - new Date(b.session_start_time)
			)
		);
	}, [tasks, selectedWeek]);

	// Current time line position
	// const linePos = (minutesOfCurrentDay / 60) * 70;
	const linePos = minutesOfCurrentDay * 1.17;
	useEffect(() => {
		const timer = setInterval(() => {
			setMinutesOfCurrentDay(
				new Date().getHours() * 60 + new Date().getMinutes()
			);
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	const changeSelectedDate = (date) => {
		// You can set this to update `selectedDate` in parent if needed
	};

	return (
		<div className="week-calendar">
			<div className="week-calendar-header">
				<div className="week-calendar-hours-header"></div>
				<div className="week-calendar-days-header">
					{selectedWeek.map((date, index) => (
						<div key={index} className="week-calendar-heading">
							<h2
								onClick={() => changeSelectedDate(date)}
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
						{currentTasks?.map((task, idx, arr) => {
							const prevTask = idx > 0 ? arr[idx - 1] : null;
							const prevTaskEndTime = prevTask
								? new Date(prevTask.session_end_time)
								: null;
							const startTime = new Date(task.session_start_time);

							if (prevTaskEndTime && prevTaskEndTime > startTime) {
								width += 10;
								return (
									<TaskCard
										key={task.id}
										taskDetails={task}
										widthOffset={width}
										viewWidth={123.8}
										selectedDate={selectedDate}
									/>
								);
							} else {
								width = 0;
							}

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
