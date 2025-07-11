import { useEffect, useState } from "react";
import "./HeaderStyle.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../api.js";
import CreateTask from "../CreateTask/CreateTask.jsx";
import Select from "react-select";

const Header = ({ setView, view, setTasks, options, handleTrainerChange }) => {
	const today = new Date();
	const formattedDate = today.toLocaleDateString();
	const navigate = useNavigate();
	const location = useLocation();
	const [createPopupOpen, setCreatePopupOpen] = useState(false);
	const user = JSON.parse(localStorage.getItem("user"));
	const selectStyles = {
		control: (provided, state) => ({
			...provided,
			background: "#ffffff",
			border: "2px solid #a2d5c6",
			borderRadius: "30px",
			padding: "2px 14px",
			minHeight: "36px", 
			boxShadow: state.isFocused
				? "0 0 0 4px rgba(162, 213, 198, 0.4)"
				: "0 4px 12px rgba(0,0,0,0.08)",
			fontSize: "15px",
			color: "#4a4a4a",
			transition: "all 0.3s ease",
			"&:hover": {
				borderColor: "#4a7c59",
				background: "#e7f8f2",
			},
		}),
		option: (provided, state) => ({
			...provided,
			background: state.isFocused
				? "#e7f8f2"
				: state.isSelected
				? "#a2d5c6"
				: "#ffffff",
			color: state.isSelected ? "#ffffff" : "#4a4a4a",
			fontSize: "14px",
			fontWeight: state.isSelected ? "600" : "normal",
			cursor: "pointer",
			"&:active": {
				background: "#a2d5c6",
				color: "#ffffff",
			},
		}),
		menu: (provided) => ({
			...provided,
			borderRadius: "20px",
			boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
			overflow: "hidden",
		}),
		singleValue: (provided) => ({
			...provided,
			color: "#4a4a4a",
			fontWeight: "500",
		}),
		placeholder: (provided) => ({
			...provided,
			color: "#888",
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: "#a2d5c6",
			"&:hover": {
				color: "#4a7c59",
			},
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
	};

	const behind_change = () => {};
	const ahead_change = () => {};

	const viewChange = (e) => {
		setView(e.target.value);
		if (e.target.value == "day") {
			navigate("/home/day-view");
		} else if (e.target.value == "week") {
			navigate("/home/week-view");
		} else if (e.target.value == "month") {
			navigate("/home/month-view");
		}
	};

	useEffect(() => {
		const selector = document.getElementById("views");
		selector.value = view;
	}, [view]);

	useEffect(() => {
		if (location.pathname === "/home/day-view") {
			setView("day");
		} else if (location.pathname === "/home/week-view") {
			setView("week");
		} else if (location.pathname === "/home/month-view") {
			setView("month");
		} else {
			setView("none");
		}
	}, [location.pathname, setView]);

	const logoutHandler = async () => {
		localStorage.clear();
		await logout();
		navigate("/login");
	};

	return (
		<div className="header-container">
			<div className="header-left">
				<div className="logo-container">
					<img
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9diqk263eRrAF-z0Q5aW5-9NEU30kObI4Lg&s"
						alt="Logo"
						className="logo"
					/>
					<label htmlFor="logo">Anudip</label>
				</div>
				<div className="today">
					<div className="button" data-tooltip-id="myTooltip">
						<span>Today</span>
						<ReactTooltip id="myTooltip" place="top" effect="solid">
							{formattedDate}
						</ReactTooltip>
					</div>
				</div>
				<div className="changer">
					<span className="arrow" onClick={behind_change}>
						&#8592;
					</span>
					<span className="arrow" onClick={ahead_change}>
						&#8594;
					</span>
				</div>
			</div>
			<div className="header-right">
				{
					user.admin == 1 &&
					<Select
						options={options}
						styles={selectStyles}
						onChange={handleTrainerChange}
					/>
				}
				<div
					className="create-btn"
					style={{ display: user.admin == 1 ? "none" : "flex" }}
					onClick={() => setCreatePopupOpen(true)}
				>
					Create
				</div>
				<CreateTask
					createOpen={createPopupOpen}
					setCreateOpen={setCreatePopupOpen}
					trainer_id={user.id}
					setTasks={setTasks}
				/>
				<div>
					<select id="views" className="dropdown" onChange={viewChange}>
						<option value="none">Select</option>
						<option value="day">Day</option>
						<option value="week">Week</option>
						<option value="month">Month</option>
					</select>
				</div>
				<div
					className="add-batch"
					style={{ display: user?.admin == 0 ? "none" : "block" }}
					onClick={() => navigate("/home/add-batch")}
				>
					Add Batch
				</div>
				<button className="logout-btn" onClick={logoutHandler}>
					Logout
				</button>
				<div className="user-info" data-username="John Doe">
					<img
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9diqk263eRrAF-z0Q5aW5-9NEU30kObI4Lg&s"
						alt="User"
						className="user-image"
					/>
				</div>
			</div>
		</div>
	);
};

export default Header;
