import "./EditTaskStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Custom from "../CustomSelection/Custom";
import { updateTask } from "../../api";

const EditTask = ({ taskDetails, editOpen, setEditOpen }) => {
	const { register, handleSubmit, watch } = useForm();
	const [repeatEnd, setRepeatEnd] = useState(taskDetails?.repeat_on !== "none");
	const [customOpen, setCustomOpen] = useState(false);
	const [customTasks, setCustomTasks] = useState([]);
	const weekNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const watchDate = watch("session_date", taskDetails?.session_date);

	const handleEdit = async (data) => {
		const session_start_time = `${data.session_date} ${data.start_time}:00`;
		const session_end_time = `${data.session_date} ${data.end_time}:00`;
		console.log("Edited Task Data: ", data, "Custom: ", customTasks);

		if (customTasks.length > 0) {
			if (customTasks.length === 0) {
				alert("Please select at least one day for custom repeat.");
				return;
			}

			for (const task of customTasks) {
				const payload = {
					course_name: data.course_name,
					repeat_on: task.repeat_on,
					session_start_time: `${task.session_date} ${data.start_time}:00`,
					session_end_time: `${task.session_date} ${data.end_time}:00`,
					trainer_id: taskDetails.trainer_id,
					repeat_end: task.repeat_end || null,
					session_date: task.session_date,
				};

				console.log("Create Custom Task Payload: ", payload);
				const res = await updateTask(taskDetails.id, payload);
				if (res?.statusCode !== 200) {
					alert("Failed to create custom task.");
					return;
				}
			}
			setCustomTasks([]);
			setCustomOpen(false);
			setEditOpen(false);
			return;
		}

		const payload = {
			course_name: data.course_name,
			session_start_time,
			session_end_time,
			trainer_id: taskDetails.trainer_id,
			location: taskDetails.location,
			repeat_on: data.repeat_on,
			repeat_end: data.repeat_end || null,
			session_date: data.session_date,
			custom_tasks: customTasks.length > 0 ? customTasks : null,
		};
		console.log("Payload for Update Task: ", taskDetails);
		const res = await updateTask(taskDetails.id, payload);
		console.log("Edit Task Response: ", res);

		setEditOpen(false);
	};

	return (
		<Popup
			open={editOpen}
			closeOnDocumentClick={false}
			modal
			className="edit-task-popup"
			overlayClassName="edit-task-overlay"
			contentStyle={{ width: "400px", height: "auto", borderRadius: "10px" }}
		>
			<div className="edit-task-container">
				<button
					className="edit-close-button"
					onClick={() => setEditOpen(false)}
				>
					<IoClose size={22} />
				</button>
				<h2>Edit Task</h2>
				<form className="edit-task-form" onSubmit={handleSubmit(handleEdit)}>
					<label htmlFor="course_name">Course Name:</label>
					<input
						type="text"
						id="course_name"
						defaultValue={taskDetails?.course_name || ""}
						{...register("course_name", { required: true })}
					/>

					<label htmlFor="session_date">Date:</label>
					<input
						type="date"
						id="session_date"
						defaultValue={taskDetails?.session_date}
						{...register("session_date", { required: true })}
					/>

					<div className="time-inputs">
						<label htmlFor="start_time">Start:</label>
						<input
							type="time"
							id="start_time"
							defaultValue={
								taskDetails?.session_start_time
									? new Date(taskDetails.session_start_time)
											.toTimeString()
											.slice(0, 5)
									: ""
							}
							{...register("start_time", { required: true })}
						/>

						<label htmlFor="end_time">End:</label>
						<input
							type="time"
							id="end_time"
							defaultValue={
								taskDetails?.session_end_time
									? new Date(taskDetails.session_end_time)
											.toTimeString()
											.slice(0, 5)
									: ""
							}
							{...register("end_time", { required: true })}
						/>
					</div>

					<label htmlFor="repeat_on">Repeat On:</label>
					<select
						id="repeat_on"
						defaultValue={taskDetails?.repeat_on || "none"}
						{...register("repeat_on", { required: true })}
						onChange={(e) => {
							if (e.target.value !== "none") {
								setRepeatEnd(true);
							} else {
								setRepeatEnd(false);
							}

							if (e.target.value === "custom") {
								setCustomOpen(true);
								e.target.value = "none";
								setRepeatEnd(false);
							}
						}}
					>
						<option value="none">No Repeat</option>
						<option value="daily">Daily</option>
						<option value="weekly">
							Weekly on {weekNames[new Date(watchDate).getDay()]}
						</option>
						<option value="monthly">
							Monthly on {new Date(watchDate).getDate()}
						</option>
						<option value="custom">Custom</option>
					</select>

					<Custom
						open={customOpen}
						setOpen={setCustomOpen}
						setCustomTasks={setCustomTasks}
					/>

					{repeatEnd && (
						<div className="no-repeat-options">
							<label htmlFor="repeat_end">Repeat End Date:</label>
							<input
								type="date"
								id="repeat_end"
								defaultValue={taskDetails?.repeat_end || ""}
								{...register("repeat_end")}
							/>
						</div>
					)}

					<button type="submit" className="submit-button">
						Save Changes
					</button>
				</form>
			</div>
		</Popup>
	);
};

export default EditTask;
