/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./TaskCardStyle.css";
import { useMemo } from "react";
import Popup from "reactjs-popup";

const TaskCard = ({ taskDetails, widthOffset, viewWidth, selectedDate }) => {
	const [open, setOpen] = useState(false);
	const [height, setHeight] = useState(20);
	const [top, setTop] = useState(0);
	const [left, setLeft] = useState(0);
	const [color, setColor] = useState("#585dfb");
	const [fontSize, setFontSize] = useState(16);

	const colors = useMemo(
		() => [
			"#FF5733",
			"#33FF57",
			"#3357FF",
			"#F1C40F",
			"#8E44AD",
			"#E67E22",
			"#2ECC71",
			"#3498DB",
			"#585dfb",
		],
		[]
	);

	useEffect(() => {
		// setting font size based on view width
		if (viewWidth > 0) {
			if (viewWidth < 200) {
				setFontSize(10);
			} else if (viewWidth < 600) {
				setFontSize(12);
			} else if (viewWidth < 800) {
				setFontSize(14);
			} else if (viewWidth < 1000) {
				setFontSize(16);
			} else {
				setFontSize(18);
			}
		} else {
			setFontSize(8); // default font size
		}
	}, [viewWidth]);

	useEffect(() => {
		// Random color selection
		setColor(colors[Math.floor(Math.random() * colors.length)]);
	}, [taskDetails, viewWidth, colors]);

	useEffect(() => {
		const startTime = new Date(taskDetails?.session_start_time);
		const endTime = new Date(taskDetails?.session_end_time);

		const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60));
		if (viewWidth > 0) {
			setHeight(1.167 * diffMinutes);
		}

		if (viewWidth != 0) {
			setTop((startTime.getHours() * 60 + startTime.getMinutes()) * 1.167);
		}
	}, [taskDetails, viewWidth]);

	useEffect(() => {
		let day = new Date(taskDetails?.session_date).getDay();
		// console.log("Day of the week:", taskDetails?.session_date);
		if (taskDetails?.repeat_on === "monthly" && selectedDate) { 
			day = new Date(taskDetails?.session_date).setMonth(selectedDate.getMonth());
			day = new Date(day).getDay();
		}
		if (viewWidth < 930 && viewWidth > 0) {
			setLeft(133 * (day + 1) - 133);
		}
	}, [taskDetails, viewWidth, selectedDate]);

	const closeModal = () => setOpen(false);

	if (!taskDetails) return <div></div>;

	return (
		<div>
			<div
				className="card-container"
				style={{
					height: `${height}px`,
					top: `${top}px`,
					left: `${left}px`,
					width: `${viewWidth > 0 ? viewWidth - widthOffset : 150}px`,
					background: `linear-gradient(135deg, ${color}, ${shadeColor(
						color,
						-20
					)})`,
					position: `${viewWidth > 0 ? "absolute" : "relative"}`,
					fontSize: `${fontSize}px`,
					borderRadius: viewWidth > 0 ? "8px" : "2px",
				}}
				onClick={() => setOpen((o) => !o)}
			>
				Lecture of {taskDetails.course_name} at {taskDetails.location}
			</div>
			<Popup open={open} onClose={closeModal} modal closeOnDocumentClick>
				<div className="popup-content">
					<h2>{taskDetails.course_name}</h2>
					<div className="popup-details">
						<p>
							📍 <strong>Location:</strong> {taskDetails.location}
						</p>
						<p>
							📅 <strong>Date:</strong>{" "}
							{new Date(taskDetails.session_date).toLocaleDateString("en-US", {
								weekday: "long",
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
						<p>
							⏰ <strong>Start:</strong>{" "}
							{new Date(taskDetails.session_start_time).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<p>
							⏱️ <strong>End:</strong>{" "}
							{new Date(taskDetails.session_end_time).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<p>
							🕒 <strong>Duration:</strong>{" "}
							{Math.floor(
								(new Date(taskDetails.session_end_time) -
									new Date(taskDetails.session_start_time)) /
									(1000 * 60)
							)}{" "}
							minutes
						</p>
					</div>
					<button className="close-button" onClick={closeModal}>
						Close
					</button>
				</div>
			</Popup>
		</div>
	);
};

export default TaskCard;

// Helper to darken the gradient
function shadeColor(color, percent) {
	const num = parseInt(color.slice(1), 16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		G = ((num >> 8) & 0x00ff) + amt,
		B = (num & 0x0000ff) + amt;
	return (
		"#" +
		(
			0x1000000 +
			(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
			(G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
			(B < 255 ? (B < 1 ? 0 : B) : 255)
		)
			.toString(16)
			.slice(1)
	);
}
