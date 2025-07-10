import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler((req, res, next) => {
	const accessToken = req.cookies?.accessToken;
	const refreshToken = req.cookies?.refreshToken;
	if (!accessToken) {
		return res.status(401).json(new ApiError(401, "Access token is missing"));
	}

	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			if (err.name === "TokenExpiredError" && refreshToken) {
				jwt.verify(
					refreshToken,
					process.env.REFRESH_TOKEN_SECRET,
					(refreshErr, refreshUser) => {
						if (refreshErr) {
							return res
								.status(403)
								.json(new ApiError(403, "Invalid refresh token"));
						}
						// If refresh token is valid, generate a new access token
						const newAccessToken = jwt.sign(
							{ id: refreshUser.id },
							process.env.ACCESS_TOKEN_SECRET,
							{ expiresIn: "15m" }
						);
						res.cookie("accessToken", newAccessToken, { httpOnly: true });
						req.user = refreshUser;
						next();
            return;
					}
				);
			} else {
				return res.status(403).json(new ApiError(403, "Invalid access token"));
			}
		}
		req.user = user;
		next();
	});
});
