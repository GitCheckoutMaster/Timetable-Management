/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./MonthCalendarStyle.css";

const MonthCalendar = ({ selectedDate }) => {
	const [selectedMonths, setSelectedMonths] = useState([]);
	const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

	useEffect(() => {
		const month = selectedDate.getMonth();
		const day = selectedDate.getDay();
		const year = selectedDate.getFullYear();

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
										className={`${date.getDate() == 1 ? "new-month" : ""}`}
									>
										<h2>
											{date.getDate()}{" "}
											{date.getDate() == 1
												? shortMonthDays[date.getMonth()]
												: ""}
										</h2>
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
