/* eslint-disable no-unused-vars */
import "./CreateTaskStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { set, useForm } from "react-hook-form";
import { createTask } from "../../api";

const CreateTask = ({ createOpen, setCreateOpen, trainer_id, setTasks }) => {
	const popupRef = useRef();
	const { register, handleSubmit, watch } = useForm();
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
		const session_start_time = `${data.session_date} ${data.start_time}:00`;
		const session_end_time = `${data.session_date} ${data.end_time}:00`;

		const payload = {
			course_name: data.course_name,
			repeat_on: data.repeat_on,
			session_start_time,
			session_end_time,
			trainer_id,
			repeat_end: data.repeat_end || null,
		};

		console.log("Create Task Payload: ", payload);

		const res = await createTask(payload);
		// console.log("Create Task Response: ", res);
		if (res?.statusCode === 200) {
			setCreateOpen(false);
			setTasks((prevTasks) => [
				...prevTasks,
				{
					course_name: data.course_name,
					session_date: data.session_date,
					session_start_time: session_start_time,
					session_end_time: session_end_time,
					trainer_id: trainer_id,
					repeat_on: data.repeat_on,
					repeat_end: data.repeat_end,
				},
			]);
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
					<select id="repeat_on" {...register("repeat_on", { required: true })}>
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
					{
						watch("repeat_on") != "none" &&
						(
							<div className="no-repeat-options">
								<label htmlFor="repeat-end">Repeat End Date:</label>
								<input type="date" name="repeat-end" id="repeat-end" {...register("repeat_end")} />
							</div>
						)
					}
					<button type="submit">Create Task</button>
				</form>
			</div>
		</Popup>
	);
};

export default CreateTask;
