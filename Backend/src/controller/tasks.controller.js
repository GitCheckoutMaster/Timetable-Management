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
		session_date
	} = req.body;

	if (
		!course_name ||
		!session_start_time ||
		!session_end_time ||
		!trainer_id ||
		!repeat_on ||
		!session_date ||
		(repeat_on !== "none" && !repeat_end)
	) {
		return res.status(400).json(new ApiError(400, "All fields are required"));
	}

	if (
		new Date(session_start_time) >= new Date(session_end_time) &&
		repeat_on === "none" && session_date > new Date().toISOString().split("T")[0]
	) {
		return res
			.status(400)
			.json(
				new ApiError(400, "Session start time must be before session end time")
			);
	}
  
	if (new Date(session_start_time) < new Date() && repeat_on === "none" && session_date > new Date().toISOString().split("T")[0]) {
		return res
			.status(400)
			.json(new ApiError(400, "Session start time cannot be in the past"));
	}

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

			const fetchQuery = "SELECT * FROM trainer_utilization WHERE id = ?";
			connection.query(fetchQuery, [results.insertId], (fetchError, fetchResults) => {
				if (fetchError) {
					console.error("Database fetch error:", fetchError);
					return res.status(500).json(new ApiError(500, "Internal server error"));
				}
				if (fetchResults.length === 0) {
					return res.status(404).json(new ApiError(404, "Task not found"));
				}
				const task = fetchResults[0];

				return res
					.status(201)
					.json(
						new ApiResponse(201, "Task created successfully", { task } )
					);
			});
		}
	);
});

export const updateTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;

	const {
		course_name, 
		session_start_time,
		session_end_time,
		trainer_id,
		location,
		repeat_on,
		repeat_end,
		session_date
	} = req.body;

	if (
		!course_name ||
		!session_start_time ||
		!session_end_time ||
		!trainer_id ||
		!repeat_on ||
		!session_date ||
		(repeat_on !== "none" && !repeat_end)
	) {
		return res.status(400).json(new ApiError(400, "All fields are required"));
	}

	if (
		new Date(session_start_time) >= new Date(session_end_time) &&
		repeat_on === "none" && session_date > new Date().toISOString().split("T")[0]
	) {
		return res
			.status(400)
			.json(
				new ApiError(400, "Session start time must be before session end time")
			);
	}

	if (new Date(session_start_time) < new Date() && repeat_on === "none" && session_date > new Date().toISOString().split("T")[0]) {
		return res
			.status(400)
			.json(new ApiError(400, "Session start time cannot be in the past"));
	}

	const query =
		"UPDATE trainer_utilization SET course_name = ?, session_start_time = ?, session_end_time = ?, trainer_id = ?, session_date = ?, location = ?, repeat_on = ?, repeat_end = ? WHERE id = ?";

	connection.query(
		query,
		[
			course_name,
			session_date.split(" ")[0] + " " + session_start_time.split(" ")[1],
			session_date.split(" ")[0] + " " + session_end_time.split(" ")[1],
			trainer_id,
			session_date,
			location != undefined ? location : "Online",
			repeat_on,
			repeat_end,
			taskId,
		], 
		(error, results) => {
			if (error) {
				console.error("Database query error:", error);
				return res.status(500).json(new ApiError(500, "Internal server error"));
			}

			if (results.affectedRows === 0) {
				return res.status(404).json(new ApiError(404, "Task not found"));
			}

			return res
				.status(200)
				.json(new ApiResponse(200, "Task updated successfully"));
		}
	);
})

export const deleteTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;

	if (!taskId) {
		return res.status(400).json(new ApiError(400, "Task ID is required"));
	}

	const query = "DELETE FROM trainer_utilization WHERE id = ?";

	connection.query(query, [taskId], (error, results) => {
		if (error) {
			console.error("Database query error:", error);
			return res.status(500).json(new ApiError(500, "Internal server error"));
		}

		if (results.affectedRows === 0) {
			return res.status(404).json(new ApiError(404, "Task not found"));
		}

		return res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
	});
})
