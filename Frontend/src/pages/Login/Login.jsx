import "./LoginStyle.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login, sendEmailForPasswordReset } from "../../api.js";
import React, { useState } from "react";

const Login = () => {
	const { register, handleSubmit } = useForm();
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const toggleActive = (e) => {
		let btn = e.target;
		if (!btn.classList.contains("active")) {
			btn.classList.add("active");
			const button2 =
				btn.id === "butt1"
					? document.getElementById("butt2")
					: document.getElementById("butt1");
			button2.classList.remove("active");
		}
	};

	const loginUser = async (data) => {
		const admin = document.getElementById("butt2").classList.contains("active")
			? 1
			: 0;
		const res = await login({ ...data, admin });
		if (res.statusCode == 200) {
			setError(null);
			navigate("/home/day-view");
		} else {
			setError(res.msg || "Login failed. Please try again.");
		}
	};

  const handleForgotPassword = async () => {
    const email = document.getElementById("emailInput").value;
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    const res = await sendEmailForPasswordReset(email);
    if (res.statusCode === 200) {
      setError("Password reset email sent successfully.");
    } else {
      setError(res.msg || "Failed to send password reset email.");
    }
  }

	return (
		<div className="login-container-main">
			<div className="login-container">
				<h2 className="login-heading">Login</h2>
				{error && <div className="login-error-message">{error}</div>}
				<div className="login-buttons">
					<button id="butt1" className="active" onClick={toggleActive}>
						Trainer
					</button>
					<button id="butt2" onClick={toggleActive}>
						Admin
					</button>
				</div>
				<form className="login-form" onSubmit={handleSubmit(loginUser)}>
					<div className="login-inp">
						<label htmlFor="email">Email</label>
						<input {...register("email", { required: true })} type="text" id="emailInput" />
					</div>
					<div className="login-inp">
						<label htmlFor="password">Password</label>
						<input
							{...register("password", { required: true })}
							type="password"
						/>
					</div>
					<div className="login-forgot-password">
						<a onClick={handleForgotPassword}>Forgot Password?</a>
					</div>
					<button type="submit" className="login-submit">
						Submit
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
