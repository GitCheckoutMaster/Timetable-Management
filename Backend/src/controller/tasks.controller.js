import asyncHandler from "../utils/asyncHandler.js";
import connection from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getAllTasks = asyncHandler(async (req, res) => {
	const query = "SELECT * FROM trainer_utilization WHERE trainer_id = ?";
	const userId = req.user.id;

	connection.query(query, [userId], (error, results) => {
		if (error) {
			console.error("Database query error:", error);
			return res.status(500).json(new ApiError(500, "Internal server error"));
		}

		return res
			.status(200)
			.json(
				new ApiResponse(200, "Tasks fetched successfully", { tasks: results })
			);
	});
});

export const createTask = asyncHandler(async (req, res) => {
	const {
		course_name,
		session_start_time,
		session_end_time,
		trainer_id,
		location,
		repeat_on,
		repeat_end,
	} = req.body;

	if (
		!course_name ||
		!session_start_time ||
		!session_end_time ||
		!trainer_id ||
		!repeat_on ||
		(repeat_on !== "none" && !repeat_end)
	) {
		return res.status(400).json(new ApiError(400, "All fields are required"));
	}

	if (
		new Date(session_start_time) >= new Date(session_end_time) &&
		repeat_on === "none"
	) {
		return res
			.status(400)
			.json(
				new ApiError(400, "Session start time must be before session end time")
			);
	}
  
	if (new Date(session_start_time) < new Date() && repeat_on === "none") {
		return res
			.status(400)
			.json(new ApiError(400, "Session start time cannot be in the past"));
	}
	const session_date = new Date(session_start_time).toISOString().slice(0, 10);

	const query =
		"INSERT INTO trainer_utilization (course_name, session_start_time, session_end_time, trainer_id, session_date, location, repeat_on, repeat_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(
		query,
		[
			course_name,
			session_start_time,
			session_end_time,
			trainer_id,
			session_date,
			location != undefined ? location : "Online",
			repeat_on,
			repeat_end,
		],
		(error, results) => {
			if (error) {
				console.error("Database query error:", error);
				return res.status(500).json(new ApiError(500, "Internal server error"));
			}

			return res
				.status(200)
				.json(
					new ApiResponse(200, "Task created successfully", {
						taskId: results.insertId,
					})
				);
		}
	);
});
