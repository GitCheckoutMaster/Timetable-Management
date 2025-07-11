import "./EditTaskStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Select from "react-select";
import Custom from "../CustomSelection/Custom";
import { updateTask, getAllBatches } from "../../api";

const EditTask = ({ taskDetails, editOpen, setEditOpen, setTasks }) => {
	const { register, handleSubmit, watch } = useForm();
	const [repeatEnd, setRepeatEnd] = useState(taskDetails?.repeat_on !== "none");
	const [customOpen, setCustomOpen] = useState(false);
	const [customTasks, setCustomTasks] = useState([]);
	const [error, setError] = useState("");
	const [batches, setBatches] = useState([]);
	const [selectedBatch, setSelectedBatch] = useState(null);

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

	const watchDate = watch("session_date", taskDetails?.session_date);

	useEffect(() => {
		const fetchBatches = async () => {
			const res = await getAllBatches();
			if (res?.statusCode === 200) {
				const batchOptions = res.data.map((batch) => ({
					value: batch.batch_code,
					label: `${batch.batch_name} (${batch.batch_code})`,
				}));
				setBatches(batchOptions);

				// set default selected
				const found = batchOptions.find(
					(opt) => opt.value === taskDetails?.batch_code
				);
				setSelectedBatch(found);
			} else {
				console.error("Failed to fetch batches:", res?.msg || "Unknown error");
			}
		};
		fetchBatches();
	}, [taskDetails]);

	function compareDates(date1, date2) {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		return d1 < d2;
	}

	const handleEdit = async (data) => {
		const session_start_time = `${data.session_date} ${data.start_time}:00`;
		const session_end_time = `${data.session_date} ${data.end_time}:00`;

		if (
			!data.course_name ||
			!data.session_date ||
			!data.start_time ||
			!data.end_time ||
			!selectedBatch
		) {
			setError("All fields are required.");
			return;
		}

		if (compareDates(data.session_date, new Date().toISOString().split("T")[0])) {
			setError("Session date cannot be in the past.");
			return;
		}

		if (data.start_time >= data.end_time) {
			setError("End time must be after start time.");
			return;
		}

		if (customTasks.length > 0) {
			for (const task of customTasks) {
				const payload = {
					course_name: data.course_name,
					repeat_on: task.repeat_on,
					session_start_time: `${task.session_date} ${data.start_time}:00`,
					session_end_time: `${task.session_date} ${data.end_time}:00`,
					trainer_id: taskDetails.trainer_id,
					repeat_end: task.repeat_end || null,
					session_date: task.session_date,
					batch_code: selectedBatch.value,
				};

				const res = await updateTask(taskDetails.id, payload);
				if (res?.statusCode !== 200) {
					// console.log(res);
					setError(res?.msg || "Failed to update custom task.");
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
			batch_code: selectedBatch.value,
		};

		const res = await updateTask(taskDetails.id, payload);
		if (res?.statusCode !== 200) {
			setError(res?.msg || "Failed to update task.");
			return;
		}

		// optionally update tasks list if parent provided setTasks
		if (setTasks) {
			setTasks((prev) =>
				prev.map((task) =>
					task.id === taskDetails.id ? { ...task, ...payload } : task
				)
			);
		}

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
					{error && <div className="edit-error-message">{error}</div>}

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

					<label htmlFor="batch">Batch:</label>
					<Select
						id="batch"
						options={batches}
						styles={selectStyles}
						value={selectedBatch}
						onChange={(option) => setSelectedBatch(option)}
						placeholder="Select a batch"
					/>

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
