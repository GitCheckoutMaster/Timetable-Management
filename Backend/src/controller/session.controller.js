import asyncHandler from "../utils/asyncHandler.js";
import connection from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const createSession = asyncHandler(async (req, res) => {
  const { task_id, session_start, trainer_id } = req.body;
  if (!task_id || !session_start || !trainer_id) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  // INSERT query
  const insertQuery = `INSERT INTO sessions (task_id, session_start, trainer_id) VALUES (?, ?, ?)`;
  
  connection.query(insertQuery, [task_id, session_start, trainer_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json(new ApiError(500, "Database error", err));
    }

    const insertedId = results.insertId;
    const selectQuery = `SELECT * FROM sessions WHERE id = ?`;
    
    connection.query(selectQuery, [insertedId], (err2, sessionRows) => {
      if (err2) {
        console.log(err2);
        return res.status(500).json(new ApiError(500, "Failed to fetch inserted session", err2));
      }

      return res.status(201).json({
        statusCode: 201,
        data: sessionRows[0],
      });
    });
  });
});


export const getSessions = asyncHandler(async (req, res) => {
  const query = `SELECT * FROM sessions`;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(new ApiError(500, "Database error", err));
    }
    return res.status(200).json(new ApiResponse(200, "Sessions fetched successfully", { sessions: results }));
  });
});

export const getSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const query = `SELECT * FROM sessions WHERE id = ?`;
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      return res.status(500).json(new ApiError(500, "Database error", err));
    }
    if (results.length === 0) {
      return res.status(404).json(new ApiError(404, "Session not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Session fetched successfully", { session: results[0] }));
  });
});

export const updateSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { session_end } = req.body;

  if (!session_end) {
    return res.status(400).json(new ApiError(400, "Session start and end times are required"));
  }

  const query = `UPDATE sessions SET session_end = ? WHERE id = ?`;
  
  connection.query(query, [session_end, sessionId], (err, results) => {
    if (err) {
      return res.status(500).json(new ApiError(500, "Database error", err));
    }
    return res.status(200).json(new ApiResponse(200, "Session updated successfully"));
  });
});