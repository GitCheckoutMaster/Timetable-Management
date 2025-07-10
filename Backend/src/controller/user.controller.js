import connection from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

async function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export const register = async (req, res) => {
  const { name, email, password, phone, admin } = req.body;

  try {
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json(new ApiError(400, "Email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await connection.query(
      "INSERT INTO users (name, email, password, phone, admin) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, admin]
    );

    return res.status(201).json(
      new ApiResponse(201, "User registered successfully", {
        id: insertResult.insertId,
        name,
        email,
      })
    );
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

export const login = async (req, res) => {
  const { email, password, admin } = req.body;

  try {
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ? AND admin = ?",
      [email, admin]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid email or admin status"));
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Invalid password"));
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .cookie("accessToken", accessToken, { httpOnly: true })
      .json(new ApiResponse(200, "Login successful", user));
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

export const getAllTrainers = async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE admin = 0"
    );

    if (rows.length === 0) {
      return res.status(404).json(new ApiError(404, "No trainers found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Trainers fetched successfully", rows));
  } catch (error) {
    console.error("Get trainers error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

export const getTaskByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [tasks] = await connection.query(
      "SELECT * FROM trainer_utilization WHERE trainer_id = ?",
      [userId]
    );

    if (tasks.length === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "No tasks found for this user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tasks fetched successfully", tasks));
  } catch (error) {
    console.error("Get tasks by user ID error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

export const logout = (_, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  return res
    .status(200)
    .json(new ApiResponse(200, "Logout successful"));
};
