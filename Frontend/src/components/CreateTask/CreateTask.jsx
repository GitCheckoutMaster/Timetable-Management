/* eslint-disable no-unused-vars */
import "./CreateTaskStyle.css";
import Popup from "reactjs-popup";
import { IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask } from "../../api";

const CreateTask = ({ createOpen, setCreateOpen, trainer_id }) => {
	const popupRef = useRef();
	const { register, handleSubmit } = useForm();
	const weekNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const [currentSelectedDate, setCurrentSelectedDate] = useState(new Date());

	if (!trainer_id) {
		return (
			<Popup
				open={createOpen}
				closeOnDocumentClick={false}
				modal
				className="create-task-popup"
				overlayClassName="create-task-overlay"
			>
				<button className="create-close-button" onClick={() => setCreateOpen(false)}>
					<IoClose size={12} />
				</button>
				<div className="create-task-error">
					<p>Please select a trainer to create a task.</p>
				</div>
			</Popup>
		);
	}

	const handleCreateTask = async (data) => {
		const res = await createTask({...data, trainer_id});
    console.log("Create Task Response: ", res);
    if (res?.status === 200) {
      setCreateOpen(false);
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
				<button className="create-close-button" onClick={() => setCreateOpen(false)}>
					<IoClose size={22} />
				</button>

				<h2>Create New Task</h2>
				<form
					className="create-task-form"
					onSubmit={handleSubmit(handleCreateTask)}
				>
					<label htmlFor="task-name">Task Name:</label>
					<input type="text" id="task-name" name="task-name" required {...register("course_name", {required: true})} />

					<label htmlFor="task-description">Description:</label>
					<textarea
						id="task-description"
						name="task-description"
						rows="4"
						required
            {...register("description", {required: true})}
					></textarea>

					<label htmlFor="task-start-time">Start Time:</label>
					<input
						type="datetime-local"
						id="task-start-time"
						name="task-start-time"
						defaultValue={new Date().toISOString().slice(0, 16)}
						onChange={(e) => {
							const selectedDate = new Date(e.target.value);
							setCurrentSelectedDate(selectedDate);
						}}
						required
            {...register("session_start_time", {required: true})}
					/>

					<label htmlFor="task-end-time">End Time:</label>
					<input
						type="datetime-local"
						id="task-end-time"
						name="task-end-time"
						defaultValue={new Date(
							new Date().setHours(new Date().getHours() + 1)
						)
							.toISOString()
							.slice(0, 16)}
						required
            {...register("session_end_time", {required: true})}
					/>

					<label htmlFor="task-priority">Repeat On:</label>
					<select id="task-priority" name="task-priority" required {...register("repeat_on", {required: true})}>
						<option value="none">No Repeat</option>
						<option value="daily">Daily</option>
						<option value="weekly">
							Weekly on {weekNames[currentSelectedDate.getDay()]}
						</option>
						<option value="monthly">
							Monthly on {currentSelectedDate.getDate()}
						</option>
						<option value="custom">Custom</option>
					</select>

					<button type="submit">Create Task</button>
				</form>
			</div>
		</Popup>
	);
};

export default CreateTask;
