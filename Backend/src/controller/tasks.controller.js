import connection from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	port: 587,
	auth: {
		user: "jay.mistrylearnig@gmail.com",
		pass: "ytgqvykzsduaxhli",
	},
});

export const getAllTasks = async (req, res) => {
	const query = "SELECT * FROM trainer_utilization WHERE trainer_id = ?";
	const userId = req.user.id;

	try {
		const [results] = await connection.query(query, [userId]);
		return res
			.status(200)
			.json(
				new ApiResponse(200, "Tasks fetched successfully", { tasks: results })
			);
	} catch (error) {
		console.error("Database query error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}
};

export const createTask = async (req, res) => {
	const {
		course_name,
		session_start_time,
		session_end_time,
		trainer_id,
		location,
		repeat_on,
		repeat_end,
		session_date,
		repeat_group_id,
		batch_code,
	} = req.body;

	if (
		!course_name ||
		!session_start_time ||
		!session_end_time ||
		!trainer_id ||
		!repeat_on ||
		!session_date ||
		!batch_code ||
		(repeat_on !== "none" && !repeat_end)
	) {
		return res.status(400).json(new ApiError(400, "All fields are required"));
	}

	// check for overlapping sessions
	const checkOverlapQuery = `SELECT * FROM trainer_utilization WHERE trainer_id = ? AND session_date = ? AND (session_start_time < ? AND session_end_time > ?)`;

	try {
		const [overlapResults] = await connection.query(checkOverlapQuery, [
			trainer_id,
			session_date.split(" ")[0],
			session_end_time,
			session_start_time,
		]);
		if (overlapResults.length > 0) {
			return res
				.status(400)
				.json(
					new ApiError(400, "This session overlaps with an existing session")
				);
		}
	} catch (error) {
		console.error("Database overlap check error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}

	// check for batch overlap
	const checkBatchOverlapQuery = `
  SELECT * FROM trainer_utilization 
  WHERE session_date = ? 
    AND batch_code = ?
    AND session_start_time < ? 
    AND session_end_time > ?
`;

	try {
		const [batchOverlapResults] = await connection.query(
			checkBatchOverlapQuery,
			[
				session_date.split(" ")[0],
				req.body.batch_code,
				session_end_time, // important: compare to end
				session_start_time, // important: compare to start
			]
		);

		if (batchOverlapResults.length > 0) {
			return res
				.status(400)
				.json(
					new ApiError(
						400,
						"This session overlaps with an existing batch session"
					)
				);
		}
	} catch (error) {
		console.error("Database batch overlap check error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}

	const query = `
		INSERT INTO trainer_utilization 
		(course_name, session_start_time, session_end_time, trainer_id, session_date, location, repeat_on, repeat_end, repeat_group_id, batch_code) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	try {
		const [insertResult] = await connection.query(query, [
			course_name,
			session_start_time,
			session_end_time,
			trainer_id,
			session_date,
			location ?? "Online",
			repeat_on,
			repeat_end,
			repeat_group_id || null,
			batch_code,
		]);

		const [fetchResults] = await connection.query(
			"SELECT * FROM trainer_utilization WHERE id = ?",
			[insertResult.insertId]
		);

		if (fetchResults.length === 0) {
			return res.status(404).json(new ApiError(404, "Task not found"));
		}

		return res
			.status(201)
			.json(
				new ApiResponse(201, "Task created successfully", {
					task: fetchResults[0],
				})
			);
	} catch (error) {
		console.error("Database query error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}
};

export const updateTask = async (req, res) => {
	const { taskId } = req.params;
	const {
		course_name,
		session_start_time,
		session_end_time,
		trainer_id,
		location,
		repeat_on,
		repeat_end,
		session_date,
		batch_code,
	} = req.body;

	if (
		!course_name ||
		!session_start_time ||
		!session_end_time ||
		!trainer_id ||
		!repeat_on ||
		!session_date ||
		!batch_code ||
		(repeat_on !== "none" && !repeat_end)
	) {
		return res.status(400).json(new ApiError(400, "All fields are required"));
	}

	if (
		new Date(session_start_time) >= new Date(session_end_time) &&
		repeat_on === "none" &&
		session_date > new Date().toISOString().split("T")[0]
	) {
		return res
			.status(400)
			.json(
				new ApiError(400, "Session start time must be before session end time")
			);
	}

	if (
		new Date(session_start_time) < new Date() &&
		repeat_on === "none" &&
		session_date > new Date().toISOString().split("T")[0]
	) {
		return res
			.status(400)
			.json(new ApiError(400, "Session start time cannot be in the past"));
	}

	// check for overlapping sessions
	const checkOverlapQuery = `SELECT * FROM trainer_utilization WHERE trainer_id = ? AND id != ? AND session_date = ? AND (session_start_time < ? AND session_end_time > ?)`;

	try {
		const [overlapResults] = await connection.query(checkOverlapQuery, [
			trainer_id,
			taskId,
			session_date.split(" ")[0],
			session_end_time,
			session_start_time,
		]);
		if (overlapResults.length > 0) {
			return res
				.status(400)
				.json(
					new ApiError(400, "This session overlaps with an existing session")
				);
		}
	} catch (error) {
		console.error("Database overlap check error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}

	// check for batch overlap
	const checkBatchOverlapQuery = `
  SELECT * FROM trainer_utilization 
  WHERE session_date = ?
		AND trainer_id != ? 
    AND batch_code = ?
    AND session_start_time < ? 
    AND session_end_time > ?
`;

	try {
		const [batchOverlapResults] = await connection.query(
			checkBatchOverlapQuery,
			[
				session_date.split(" ")[0],
				trainer_id,
				batch_code,
				session_end_time,
				session_start_time,
			]
		);

		if (batchOverlapResults.length > 0) {
			return res
				.status(400)
				.json(
					new ApiError(
						400,
						"This session overlaps with an existing batch session"
					)
				);
		}
	} catch (error) {
		console.error("Database batch overlap check error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}

	const query = `
		UPDATE trainer_utilization SET
		course_name = ?, session_start_time = ?, session_end_time = ?, 
		trainer_id = ?, session_date = ?, location = ?, repeat_on = ?, repeat_end = ?, batch_code = ?
		WHERE id = ?
	`;

	try {
		const [result] = await connection.query(query, [
			course_name,
			session_date.split(" ")[0] + " " + session_start_time.split(" ")[1],
			session_date.split(" ")[0] + " " + session_end_time.split(" ")[1],
			trainer_id,
			session_date,
			location ?? "Online",
			repeat_on,
			repeat_end,
			batch_code,
			taskId,
		]);

		if (result.affectedRows === 0) {
			return res.status(404).json(new ApiError(404, "Task not found"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, "Task updated successfully"));
	} catch (error) {
		console.error("Database update error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}
};

export const deleteTask = async (req, res) => {
	const { taskId } = req.params;

	if (!taskId) {
		return res.status(400).json(new ApiError(400, "Task ID is required"));
	}

	const query = "DELETE FROM trainer_utilization WHERE id = ?";

	try {
		const [result] = await connection.query(query, [taskId]);

		if (result.affectedRows === 0) {
			return res.status(404).json(new ApiError(404, "Task not found"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, "Task deleted successfully"));
	} catch (error) {
		console.error("Database delete error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}
};

export const deleteTaskGroup = async (req, res) => {
	const { repeatGroupId } = req.params;
	if (!repeatGroupId) {
		return res
			.status(400)
			.json(new ApiError(400, "Repeat group ID is required"));
	}
	const query = "DELETE FROM trainer_utilization WHERE repeat_group_id = ?";
	try {
		const [result] = await connection.query(query, [repeatGroupId]);

		if (result.affectedRows === 0) {
			return res.status(404).json(new ApiError(404, "Task group not found"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, "Task group deleted successfully"));
	} catch (error) {
		console.error("Database delete error:", error);
		return res.status(500).json(new ApiError(500, "Internal server error"));
	}
};

export const sendEmail = async (req, res) => {
	const { task } = req.body;

	if (!task || !task.course_name || !task.session_start_time) {
		return res.status(400).json(new ApiError(400, "Task details are required"));
	}

	try {
		const info = await transporter.sendMail({
			from: "jay.mistrylearnig@gmail.com",
			to: "omvjoshi297@gmail.com",
			subject: "Task Reminder",
			text: `This is a reminder that your session of ${task.course_name} is on ${task.session_start_time}`,
		});

		if (!info) {
			return res.status(500).json(new ApiError(500, "Failed to send email"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, "Email sent successfully"));
	} catch (error) {
		console.error("Email error:", error);
		return res.status(500).json(new ApiError(500, "Email sending failed"));
	}
};
