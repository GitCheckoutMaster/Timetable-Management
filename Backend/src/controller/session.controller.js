import connection from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const createSession = async (req, res) => {
  const { task_id, session_start, trainer_id } = req.body;

  if (!task_id || !session_start || !trainer_id) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  try {
    const [insertResult] = await connection.query(
      `INSERT INTO sessions (task_id, session_start, trainer_id) VALUES (?, ?, ?)`,
      [task_id, session_start, trainer_id]
    );

    const insertedId = insertResult.insertId;

    const [sessionRows] = await connection.query(
      `SELECT * FROM sessions WHERE id = ?`,
      [insertedId]
    );

    return res.status(201).json({
      statusCode: 201,
      data: sessionRows[0],
    });

  } catch (err) {
    console.error("Create session error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
};

export const getSessions = async (req, res) => {
  try {
    const [results] = await connection.query(`SELECT * FROM sessions`);
    return res.status(200).json(
      new ApiResponse(200, "Sessions fetched successfully", {
        sessions: results,
      })
    );
  } catch (err) {
    console.error("Get sessions error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
};

export const getSessionById = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [results] = await connection.query(
      `SELECT * FROM sessions WHERE id = ?`,
      [sessionId]
    );

    if (results.length === 0) {
      return res.status(404).json(new ApiError(404, "Session not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "Session fetched successfully", {
        session: results[0],
      })
    );
  } catch (err) {
    console.error("Get session by ID error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
};

export const updateSessionById = async (req, res) => {
  const { sessionId } = req.params;
  const { session_end } = req.body;

  if (!session_end) {
    return res
      .status(400)
      .json(new ApiError(400, "Session start and end times are required"));
  }

  try {
    await connection.query(
      `UPDATE sessions SET session_end = ? WHERE id = ?`,
      [session_end, sessionId]
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Session updated successfully"));
  } catch (err) {
    console.error("Update session error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
};
