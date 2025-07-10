import connection from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

async function generateTokens(user) {
	const accessToken = await jwt.sign(
		{ id: user.id, email: user.email },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "15m" }
	);

	const refreshToken = await jwt.sign(
		{ id: user.id, email: user.email },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "7d" }
	);

	return { accessToken, refreshToken };
}

export const register = (async (req, res) => {
  const { name, email, password, phone, admin } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  connection.query(query, [email], async (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      throw new ApiError(500, "Internal server error");
    }

    if (results.length > 0) {
      return res.status(400).json(new ApiError(400, "Email already exists"));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = "INSERT INTO users (name, email, password, phone, admin) VALUES (?, ?, ?, ?, ?)";
    connection.query(insertQuery, [name, email, hashedPassword, phone, admin], (insertError, insertResults) => {
      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new ApiError(500, "Internal server error");
      }

      return res.status(201).json(new ApiResponse(201, "User registered successfully", { id: insertResults.insertId, name, email }));
    });
  });
});

export const login = (async (req, res) => {
	const { email, password, admin } = req.body;
	const query = "SELECT * FROM users WHERE email=? AND admin=?";

	connection.query(query, [email, admin], async (error, results) => {
		if (error) {
			console.error("Database query error:", error);
			return res.status(500).json( new ApiError(500, "Internal server error") );
		}

		if (results.length === 0) {
			return res.status(401).json(new ApiError(401, "Invalid email or admin status"));
		}

		const user = results[0];

		// compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json(new ApiError(401, "Invalid password"));
		}

		// generate tokens
		const { accessToken, refreshToken } = await generateTokens(user);

		return res
			.status(200)
			.cookie("refreshToken", refreshToken, {
				httpOnly: true,
			})
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
			.json(new ApiResponse(200, "Login successful", user));
	});
});

export const getAllTrainers = (async (req, res) => {
	const query = "SELECT * FROM users WHERE admin = 0";

	connection.query(query, (error, results) => {
		if (error) {
			console.error("Database query error:", error);
			return res.status(500).json(new ApiError(500, "Internal server error"));
		}

		if (results.length === 0) {
			return res.status(404).json(new ApiError(404, "No trainers found"));
		}

		return res.status(200).json(new ApiResponse(200, "Trainers fetched successfully", results));
	});
});

export const getTaskByUserId = (async (req, res) => {
	const userId = req.params.userId;
	const query = "SELECT * FROM trainer_utilization WHERE trainer_id = ?";

	connection.query(query, [userId], (error, results) => {
		if (error) {
			console.error("Database query error:", error);
			return res.status(500).json(new ApiError(500, "Internal server error"));
		}

		if (results.length === 0) {
			return res.status(404).json(new ApiError(404, "No tasks found for this user"));
		}

		return res.status(200).json(new ApiResponse(200, "Tasks fetched successfully", results));
	});
});

export const logout = (async (_, res) => {
	res.clearCookie("refreshToken");
	res.clearCookie("accessToken");
	return res.status(200).json(new ApiResponse(200, "Logout successful"));
});
