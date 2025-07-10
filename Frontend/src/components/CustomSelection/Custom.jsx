import "./CustomStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useState } from "react";

const Custom = ({ open, setOpen, setCustomTasks }) => {
	const [selectedDays, setSelectedDays] = useState([]);

	const handleDayClick = (day) => {
		if (selectedDays.includes(day)) {
			setSelectedDays(selectedDays.filter((d) => d !== day));
			document.getElementById(`custom-day-${day}`).classList.remove("selected");
		} else {
			setSelectedDays([...selectedDays, day]);
			document.getElementById(`custom-day-${day}`).classList.add("selected");
		}
	};

	function getNextDayDate(targetDay) {
		const today = new Date();
		const currentDay = today.getDay();

		// calculate how many days to add
		let diff = targetDay - currentDay;
    if (diff === 0) {
      return today; 
    }
		if (diff < 0) {
			diff += 7; // ensures it goes to next week's day if already passed
		}

		const nextDate = new Date(today);
		nextDate.setDate(today.getDate() + diff);
		return nextDate;
	}

	const HandleCreateTask = () => {
		const endDate = document.getElementById("end-date").value;
		const tasks = selectedDays.map((day) => {
			const session_end = new Date(endDate);
			const repeatOn = "weekly";
			const session_date = getNextDayDate(day);

      return {
        repeat_end: session_end.toISOString().split("T")[0],
        repeat_on: repeatOn,
        session_date: session_date.toISOString().split("T")[0],
        day: day,
      }
		});
    setCustomTasks(tasks);
    console.log("Custom Tasks Created:", tasks);
    setOpen(false);
	};

	return (
		<Popup
			open={open}
			onClose={() => setOpen(false)}
			closeOnDocumentClick={false}
			modal
			className="custom-popup"
			overlayClassName="custom-overlay"
		>
			<button className="custom-close-button" onClick={() => setOpen(false)}>
				<IoClose size={20} />
			</button>
			<div className="custom-content">
				<h2>Custom Selection</h2>
				<label htmlFor="repetition">Repeat On: </label>
				<div className="weekdays">
					<div
						className="weekday"
						id="custom-day-0"
						onClick={() => handleDayClick(0)}
					>
						S
					</div>
					<div
						className="weekday"
						id="custom-day-1"
						onClick={() => handleDayClick(1)}
					>
						M
					</div>
					<div
						className="weekday"
						id="custom-day-2"
						onClick={() => handleDayClick(2)}
					>
						T
					</div>
					<div
						className="weekday"
						id="custom-day-3"
						onClick={() => handleDayClick(3)}
					>
						W
					</div>
					<div
						className="weekday"
						id="custom-day-4"
						onClick={() => handleDayClick(4)}
					>
						T
					</div>
					<div
						className="weekday"
						id="custom-day-5"
						onClick={() => handleDayClick(5)}
					>
						F
					</div>
					<div
						className="weekday"
						id="custom-day-6"
						onClick={() => handleDayClick(6)}
					>
						S
					</div>
				</div>

				<div className="end-date">
					<label htmlFor="end-date">End Date: </label>
					<input type="date" id="end-date" name="end-date" />
				</div>
				<div className="create-custom-button" onClick={HandleCreateTask}>
					Create
				</div>
			</div>
		</Popup>
	);
};

export default Custom;
