import { useEffect, useState } from "react";
import "./TaskCardStyle.css";
import Popup from "reactjs-popup";
import { getSessionById } from "../../api";
import EditTask from "../EditTask/EditTask";
import Delete from "../DeletePopup/Delete";

const TaskCard = ({ taskDetails, widthOffset, viewWidth, selectedDate }) => {
	const [open, setOpen] = useState(false);
	const [height, setHeight] = useState(20);
	const [top, setTop] = useState(0);
	const [left, setLeft] = useState(0);
	const [color, setColor] = useState("#585dfb");
	const [fontSize, setFontSize] = useState(16);
	const [session, setSession] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const user = JSON.parse(localStorage.getItem("user"));
	const canEdit = user?.id === taskDetails?.trainer_id;

	useEffect(() => {
		const fetchSession = async () => {
			const res = await getSessionById(taskDetails.id);
			if (res?.statusCode === 200) {
				const s = res.data;
				setSession(s);

				if (!s) {
					setColor("#FF4C4C"); // RED
				} else if (s.session_start && !s.session_end) {
					setColor("#FFA500"); // ORANGE
				} else if (s.session_start && s.session_end) {
					setColor("#32CD32"); // GREEN
				}
			} else {
				setColor("#FF4C4C");
				console.error("Failed to fetch session details");
			}
		};

		if (taskDetails?.id) {
			fetchSession();
		}
	}, [taskDetails]);

	useEffect(() => {
		if (viewWidth > 0) {
			if (viewWidth < 200) setFontSize(10);
			else if (viewWidth < 600) setFontSize(12);
			else if (viewWidth < 800) setFontSize(14);
			else if (viewWidth < 1000) setFontSize(16);
			else setFontSize(18);
		} else {
			setFontSize(8);
		}
	}, [viewWidth]);

	useEffect(() => {
		const startTime = new Date(taskDetails?.session_start_time);
		const endTime = new Date(taskDetails?.session_end_time);
		const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60));
		if (viewWidth > 0) setHeight(1.167 * diffMinutes);
		if (viewWidth !== 0) setTop((startTime.getHours() * 60 + startTime.getMinutes()) * 1.167);
	}, [taskDetails, viewWidth]);

	useEffect(() => {
		let day = new Date(taskDetails?.session_date).getDay();
		if (taskDetails?.repeat_on === "monthly" && selectedDate) {
			day = new Date(taskDetails?.session_date).setMonth(selectedDate.getMonth());
			day = new Date(day).getDay();
		}
		if (viewWidth < 930 && viewWidth > 0) {
			setLeft(133 * (day + 1) - 133);
		}
	}, [taskDetails, viewWidth, selectedDate]);

	const closeModal = () => setOpen(false);

	const handleEdit = () => {
		if (session) {
			alert("You cannot edit a task that has an ongoing or completed session.");
			return;
		}
		if (new Date(taskDetails.session_start_time) < new Date()) {
			alert("You cannot edit a task that is in the past.");
			return;
		}
		setOpen(false);
		setEditOpen(true);
	};

	const handleDelete = () => {
		if (session) {
			alert("You cannot delete a task that has an ongoing or completed session.");
			return;
		}
		if (new Date(taskDetails.session_start_time) < new Date()) {
			alert("You cannot delete a task that is in the past.");
			return;
		}
		setDeleteOpen(true);
	};

	if (!taskDetails) return <div></div>;

	return (
		<>
			<div
				className="card-container"
				style={{
					height: `${height}px`,
					top: `${top}px`,
					left: `${left}px`,
					width: `${viewWidth > 0 ? viewWidth - widthOffset : 150}px`,
					background: `linear-gradient(135deg, ${color}, ${shadeColor(color, -20)})`,
					position: `${viewWidth > 0 ? "absolute" : "relative"}`,
					fontSize: `${fontSize}px`,
					borderRadius: viewWidth > 0 ? "8px" : "2px",
				}}
				onClick={() => setOpen(true)}
			>
				<div>{taskDetails.course_name}</div>

				{session && (
					<div className="session-info">
						<span>
							🟢{" "}
							{new Date(session.session_start).toLocaleTimeString([], {
								hour: "2-digit", minute: "2-digit",
							})}
						</span>
						<span>
							🔴{" "}
							{session.session_end
								? new Date(session.session_end).toLocaleTimeString([], {
										hour: "2-digit", minute: "2-digit",
								  })
								: "—"}
						</span>
					</div>
				)}
			</div>

			<Popup open={open} closeOnDocumentClick={false} modal>
				<div className="popup-content">
					<h2>{taskDetails.course_name}</h2>
					<div className="popup-details">
						<p>📍 <strong>Location:</strong> {taskDetails.location}</p>
						<p>📅 <strong>Date:</strong>{" "}
							{new Date(taskDetails.session_date).toLocaleDateString("en-US", {
								weekday: "long", month: "short", day: "numeric", year: "numeric",
							})}
						</p>
						<p>⏰ <strong>Start:</strong>{" "}
							{new Date(taskDetails.session_start_time).toLocaleTimeString([], {
								hour: "2-digit", minute: "2-digit",
							})}
						</p>
						<p>⏱️ <strong>End:</strong>{" "}
							{new Date(taskDetails.session_end_time).toLocaleTimeString([], {
								hour: "2-digit", minute: "2-digit",
							})}
						</p>
						<p>🕒 <strong>Duration:</strong>{" "}
							{Math.floor(
								(new Date(taskDetails.session_end_time) -
									new Date(taskDetails.session_start_time)) / (1000 * 60)
							)} min
						</p>

						{session && (
							<>
								<hr />
								<p>🟢 <strong>Session Start:</strong>{" "}
									{new Date(session.session_start).toLocaleTimeString([], {
										hour: "2-digit", minute: "2-digit",
									})}
								</p>
								<p>🔴 <strong>Session End:</strong>{" "}
									{session.session_end
										? new Date(session.session_end).toLocaleTimeString([], {
												hour: "2-digit", minute: "2-digit",
										  })
										: "—"}
								</p>
							</>
						)}
					</div>

					<div style={{ display: "flex", gap: "1rem", marginTop: "20px" }}>
						<button className="close-button" onClick={closeModal}>
							Close
						</button>
						{canEdit && (
							<>
								<button className="edit-button" onClick={handleEdit}>
									Edit
								</button>
								<button className="delete-button" onClick={handleDelete}>
									Delete
								</button>
							</>
						)}
					</div>
				</div>
			</Popup>

			<EditTask
				taskDetails={taskDetails}
				editOpen={editOpen}
				setEditOpen={setEditOpen}
			/>
			<Delete 
				open={deleteOpen}
				setOpen={setDeleteOpen}
				taskId={taskDetails.id}
			/>
		</>
	);
};

export default TaskCard;

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
