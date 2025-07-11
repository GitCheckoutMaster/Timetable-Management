import connection from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const addBatch = async (req, res) => {
  const { batch_code, batch_name } = req.body;

  if (!batch_code || !batch_name) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  try {
    const [insertResult] = await connection.query(
      `INSERT INTO batch (batch_code, batch_name) VALUES (?, ?)`,
      [batch_code, batch_name]
    );

    const [batchRows] = await connection.query(
      `SELECT * FROM batch WHERE batch_code = ?`,
      [batch_code]
    );

    return res.status(201).json({
      statusCode: 201,
      data: batchRows[0],
    });

  } catch (err) {
    console.error("Add batch error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
}

export const deleteBatch = async (req, res) => {
  const { batchCode } = req.params;

  if (!batchCode) {
    return res.status(400).json(new ApiError(400, "Batch code is required"));
  }

  try {
    const [deleteResult] = await connection.query(
      `DELETE FROM batch WHERE batch_code = ?`,
      [batchCode]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json(new ApiError(404, "Batch not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Batch deleted successfully"));

  } catch (err) {
    console.error("Delete batch error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
}

export const getAllBatches = async (req, res) => {
  try {
    const [rows] = await connection.query(`SELECT * FROM batch`);

    if (rows.length === 0) {
      return res.status(404).json(new ApiError(404, "No batches found"));
    }

    return res.status(200).json({
      statusCode: 200,
      data: rows,
    });

  } catch (err) {
    console.error("Get all batches error:", err);
    return res.status(500).json(new ApiError(500, "Database error", err));
  }
}