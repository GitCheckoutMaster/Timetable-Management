import "./CreateTaskStyle.css";
import Popup from "reactjs-popup";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask, getAllBatches } from "../../api";
import Custom from "../CustomSelection/Custom";
import { v4 as uuidv4 } from "uuid";
import Select from "react-select";

const CreateTask = ({ createOpen, setCreateOpen, trainer_id, setTasks }) => {
	const popupRef = useRef();
	const { register, handleSubmit, watch } = useForm();
	const [repeatEnd, setRepeatEnd] = useState(false);
	const [customOpen, setCustomOpen] = useState(false);
	const [customTasks, setCustomTasks] = useState([]);
	const [batches, setBatches] = useState([]);
	const [selectedBatch, setSelectedBatch] = useState(null);
	const [error, setError] = useState(null);
	const weekNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const selectStyles = {
		control: (provided, state) => ({
			...provided,
			background: "#ffffff",
			borderColor: "#a2d5c6",
			borderRadius: "15px",
			boxShadow: state.isFocused
				? "0 0 0 2px rgba(162, 213, 198, 0.5)"
				: "0 4px 12px rgba(0,0,0,0.05)",
			padding: "4px 8px",
			"&:hover": {
				borderColor: "#4a7c59",
			},
		}),
		option: (provided, state) => ({
			...provided,
			background: state.isFocused
				? "#e7f8f2"
				: state.isSelected
				? "#a2d5c6"
				: "#ffffff",
			color: state.isSelected ? "#fff" : "#4a7c59",
			cursor: "pointer",
			fontSize: "14px",
			"&:active": {
				background: "#a2d5c6",
				color: "#fff",
			},
		}),
		menu: (provided) => ({
			...provided,
			borderRadius: "15px",
			overflow: "hidden",
			boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
		}),
		singleValue: (provided) => ({
			...provided,
			color: "#4a7c59",
			fontWeight: 500,
		}),
		placeholder: (provided) => ({
			...provided,
			color: "#888",
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: "#a2d5c6",
			"&:hover": {
				color: "#4a7c59",
			},
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
	};

	useEffect(() => {
		const fetchBatches = async () => {
			const res = await getAllBatches();
			if (res?.statusCode === 200) {
				setBatches(
					res.data.map((batch) => ({
						value: batch.batch_code,
						label: `${batch.batch_name} (${batch.batch_code})`,
					}))
				);
			} else {
				console.error("Failed to fetch batches:", res?.msg || "Unknown error");
			}
		};
		fetchBatches();
	}, []);

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

	function compareDates(date1, date2) {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		return d1 < d2;
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
		const batch_code = selectedBatch.value;

		if (!course_name || !session_date || !start_time || !end_time || !batch_code) {
			setError("All fields are required.");
			return;
		}

		if (compareDates(session_date, new Date().toISOString().split("T")[0])) {
			setError("Session date cannot be in the past.");
			return;
		}
		
		if (start_time.split(":")[0] >= end_time.split(":")[0]) {
			if (data.start_time.split(":")[0] == data.end_time.split(":")[0] && data.start_time.split(":")[1] >= data.end_time.split(":")[1]) {
				setError("End time must be after start time.");
				return;
			} else if (data.start_time.split(":")[0] > data.end_time.split(":")[0]) {
				setError("End time must be after start time.");
				return;
			}
		}
		if (new Date(start_time) < new Date()) {
			setError("Start time cannot be in the past.");
			return;
		}

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
					batch_code,
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
				batch_code,
				repeat_group_id: null,
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
					batch_code,
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
					setError(res?.msg || "Failed to create task");
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
			setError(null);
			setCustomTasks([]);
			setCustomOpen(false);
			setCreateOpen(false);
		} catch (err) {
			console.error("Task creation failed:", err);
			setError(err.data.msg || "Failed to create task");
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
					onClick={() => {
						setCreateOpen(false);
						setError(null);
					}}
				>
					<IoClose size={22} />
				</button>
				{error && <div className="create-task-error">{error}</div>}
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

					<label htmlFor="batch">Batch:</label>
					<Select
						id="batch"
						options={batches}
						styles={selectStyles}
						value={selectedBatch}
						onChange={(option) => {
							console.log("Selected batch:", option);
							setSelectedBatch(option)
						}}
						placeholder="Select a batch"
					/>

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
