/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./WeekCalendarStyle.css";

const WeekCalendar = ({ selectedDate }) => {
	const [selectedWeek, setSelectedWeek] = useState([]);
	const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const today = new Date();
	const [minutesOfCurrentDay, setMinutesOfCurrentDay] = useState(
		today.getHours() * 60 + today.getMinutes()
	);
	
	useEffect(() => {
		const day = selectedDate.getDay();
		const date = selectedDate.getDate();
		const month = selectedDate.getMonth();
		const year = selectedDate.getFullYear();
		
		const startOfWeek = new Date(year, month, date - day);
		setSelectedWeek(
			Array.from({ length: 7 }, (_, i) => {
				const currentDate = new Date(startOfWeek);
				currentDate.setDate(startOfWeek.getDate() + i);
				return currentDate;
			})
		);
	}, [selectedDate]);
	
	const linePos = (minutesOfCurrentDay / 60) * 82.6;
  useEffect(() => {
		const timer = setInterval(() => {
			setMinutesOfCurrentDay(new Date().getHours() * 60 + new Date().getMinutes());
    }, 60000); 
    return () => clearInterval(timer);
  }, []);
	

	const changeSelectedDate = (date) => {
		
	};

	return (
		<div className="week-calendar">
			<div className="week-calendar-header">
				{selectedWeek.map((date, index) => (
					<div key={index} className="week-calendar-heading">
						{new Date().getDate() != date.getDate() && (
							<h2 onClick={() => changeSelectedDate(date)}>{date.getDate()}</h2>
						)}
						{new Date().getDate() == date.getDate() && (
							<h2
								onClick={() => changeSelectedDate(date)}
								className="active-date"
							>
								{date.getDate()}
							</h2>
						)}
						<h3> {shortWeekDays[date.getDay()]} </h3>
					</div>
				))}
			</div>
			<div className="week-calendar-body">
				{
					// <div
					// 	className="week-current-time-line"
					// 	style={{ top: `${linePos}px`, left: `${124 + (157.5 * 6)}px` }}
					// ></div>
					selectedWeek.find((date) => (date.getDate() == new Date().getDate() && date.getMonth() == new Date().getMonth() && date.getFullYear() == new Date().getFullYear())) &&
					<div
						className="week-current-time-line"
						style={{ top: `${linePos}px`, left: `${124 + (157.5 * selectedWeek.findIndex(d => d.getDate() == new Date().getDate() && d.getMonth() == new Date().getMonth() && d.getFullYear() == new Date().getFullYear()))}px` }}
					></div>
				}
				<table className="week-calendar-hours">
					{[...Array(23)].map((_, hour) => {
						return (
							<tr key={hour + 1} className="week-hour">
								{hour + 1 < 12
									? `${hour + 1} AM`
									: hour + 1 === 12
									? "12 PM"
									: `${hour + 1 - 12} PM`}
							</tr>
						);
					})}
				</table>
				<table className="week-calendar-table">
					{[...Array(24)].map((_, hour) => {
						return (
							<tr key={hour} className="inactive-hour">
								{selectedWeek.map((date, index) => {
									return <td></td>;
								})}
							</tr>
						);
					})}
				</table>
			</div>
		</div>
	);
};

export default WeekCalendar;
