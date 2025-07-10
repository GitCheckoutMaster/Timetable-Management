import "./CreateTaskStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask } from "../../api";
import Custom from "../CustomSelection/Custom";
import { v4 as uuidv4 } from 'uuid';

const CreateTask = ({ createOpen, setCreateOpen, trainer_id, setTasks }) => {
	const popupRef = useRef();
	const { register, handleSubmit, watch } = useForm();
	const [repeatEnd, setRepeatEnd] = useState(false);
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

	const watchDate = watch(
		"session_date",
		new Date().toISOString().split("T")[0]
	);

	if (!trainer_id) {
		return (
			<Popup
				open={createOpen}
				closeOnDocumentClick={false}
				modal
				className="create-task-popup"
				overlayClassName="create-task-overlay"
			>
				<button
					className="create-close-button"
					onClick={() => setCreateOpen(false)}
				>
					<IoClose size={12} />
				</button>
				<div className="create-task-error">
					<p>Please select a trainer to create a task.</p>
				</div>
			</Popup>
		);
	}

	const handleCreateTask = async (data) => {
		const {
			course_name,
			repeat_on,
			repeat_end,
			session_date,
			start_time,
			end_time,
		} = data;
		const endDate = repeat_end ? new Date(repeat_end) : null;

		let tasksToCreate = [];

		if (customTasks.length > 0) {
			const repeatGroupId = uuidv4();
			console.log("Creating custom tasks with group ID:", repeatGroupId);
			for (const task of customTasks) {
				tasksToCreate.push({
					course_name,
					repeat_on: "custom",
					session_start_time: `${task.session_date} ${start_time}:00`,
					session_end_time: `${task.session_date} ${end_time}:00`,
					trainer_id,
					repeat_end: task.repeat_end || null,
					session_date: task.session_date,
					repeat_group_id: repeatGroupId, 
				});
			}
		} else if (repeat_on === "none") {
			// Single task
			tasksToCreate.push({
				course_name,
				repeat_on,
				session_start_time: `${session_date} ${start_time}:00`,
				session_end_time: `${session_date} ${end_time}:00`,
				trainer_id,
				repeat_end: null,
				session_date,
			});
		} else if (["daily", "weekly", "monthly"].includes(repeat_on)) {
			if (!endDate) {
				alert("Repeat end date is required for repeat tasks.");
				return;
			}

			let currentDate = new Date(session_date);
			const repeatGroupId = uuidv4(); 
			while (currentDate <= endDate) {
				const dateStr = currentDate.toISOString().split("T")[0];
				tasksToCreate.push({
					course_name,
					repeat_on,
					session_start_time: `${dateStr} ${start_time}:00`,
					session_end_time: `${dateStr} ${end_time}:00`,
					trainer_id,
					repeat_end: repeat_end,
					session_date: dateStr,
					repeat_group_id: repeatGroupId,
				});

				// increment
				if (repeat_on === "daily") {
					currentDate.setDate(currentDate.getDate() + 1);
				} else if (repeat_on === "weekly") {
					currentDate.setDate(currentDate.getDate() + 7);
				} else if (repeat_on === "monthly") {
					currentDate.setMonth(currentDate.getMonth() + 1);
				}
			}
		}

		// send req to backend
		try {
			for (const payload of tasksToCreate) {
				console.log("Creating task:", payload);
				const res = await createTask(payload);
				if (res?.statusCode !== 201) {
					alert("Failed to create task");
					return;
				}
				setTasks((prev) => [
					...prev,
					{
						id: res.data.task.id,
						...payload,
					},
				]);
			}

			setCustomTasks([]);
			setCustomOpen(false);
			setCreateOpen(false);
		} catch (err) {
			console.error("Task creation failed:", err);
			alert("Something went wrong creating tasks.");
		}
	};

	return (
		<Popup
			open={createOpen}
			closeOnDocumentClick={false}
			modal
			className="create-task-popup"
			overlayClassName="create-task-overlay"
			contentStyle={{ width: "400px", height: "auto", borderRadius: "10px" }}
		>
			<div ref={popupRef} className="create-task-container">
				<button
					className="create-close-button"
					onClick={() => setCreateOpen(false)}
				>
					<IoClose size={22} />
				</button>

				<h2>Create New Task</h2>
				<form
					className="create-task-form"
					onSubmit={handleSubmit(handleCreateTask)}
				>
					<label htmlFor="task-name">Course Name:</label>
					<input
						type="text"
						id="task-name"
						{...register("course_name", { required: true })}
					/>

					<label htmlFor="session_date">Date:</label>
					<input
						type="date"
						id="session_date"
						defaultValue={new Date().toISOString().split("T")[0]}
						{...register("session_date", { required: true })}
					/>

					<div className="time-inputs">
						<label htmlFor="start_time">Start:</label>
						<input
							type="time"
							id="start_time"
							defaultValue={new Date().toTimeString().slice(0, 5)}
							{...register("start_time", { required: true })}
						/>

						<label htmlFor="end_time">End:</label>
						<input
							type="time"
							id="end_time"
							defaultValue={new Date(new Date().getTime() + 60 * 60 * 1000)
								.toTimeString()
								.slice(0, 5)}
							{...register("end_time", { required: true })}
						/>
					</div>

					<label htmlFor="repeat_on">Repeat On:</label>
					<select
						id="repeat_on"
						{...register("repeat_on", { required: true })}
						onChange={(e) => {
							if (e.target.value != "none") {
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
							<label htmlFor="repeat-end">Repeat End Date:</label>
							<input
								type="date"
								name="repeat-end"
								id="repeat-end"
								{...register("repeat_end")}
							/>
						</div>
					)}
					<button type="submit">Create Task</button>
				</form>
			</div>
		</Popup>
	);
};

export default CreateTask;
