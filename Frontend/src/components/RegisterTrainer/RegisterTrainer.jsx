/* eslint-disable no-unused-vars */
import "./RegisterTrainerStyle.css";
import { useForm } from "react-hook-form";
import { register as registerUser } from "../../api.js"; 

const RegisterTrainer = () => {
	const { register, handleSubmit, errors } = useForm();
	const user = JSON.parse(localStorage.getItem("user"));

	if (!user || user.admin !== 1) {
		return (
			<div className="error-message">
				You do not have permission to access this page.
			</div>
		);
	}

	const onSubmit = async (data) => {
    const res = await registerUser(data);
    console.log("Registration response:", res);
  };

	return (
		<div className="register-trainer-container">
			<h2>Add Trainer/Admin</h2>
			<form className="register-trainer-form" onSubmit={handleSubmit(onSubmit)}>
				<div className="form-group">
					<label htmlFor="name">Name:</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						{...register("name", { required: true })}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="email">Email:</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						{...register("email", { required: true })}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						{...register("password", { required: true })}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="phone">Mobile Number:</label>
					<input
						type="text"
						id="phone"
						name="phone"
						required
						{...register("phone", { required: true })}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="role">Role:</label>
					<select
						id="role"
						name="role"
						{...register("admin", { required: true })}
					>
						<option value="0">Trainer</option>
						<option value="1">Admin</option>
					</select>
				</div>

				<button type="submit">Register</button>
			</form>
		</div>
	);
};

export default RegisterTrainer;
