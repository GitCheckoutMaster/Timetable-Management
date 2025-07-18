import "./HomeStyle.css";
import Header from "../../components/Header/Header";

/* https://www.npmjs.com/package/react-calendar to refer this tool */
import Calendar from "react-calendar";
import "./../../../node_modules/react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTasks, getAllTrainers, getTaskById, sendEmail } from "../../api.js";
import { Outlet } from "react-router-dom";


const sendReminder = async (task) => {
	const res = await sendEmail(task);
	console.log("Email sent response: ", res);
}

const Home = () => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [tasks, setTasks] = useState([]);
	const [view, setView] = useState("day");
	const navigate = useNavigate();
	const [upcomingTasks, setUpcomingTasks] = useState([]);
	const [trainers, setTrainers] = useState([]);
	const user = JSON.parse(localStorage.getItem("user"));

	useEffect(() => {
		if (!localStorage.getItem("user")) {
			navigate("/login");
		}
	}, [navigate]);
	const [options, setOptions] = useState([]);

	useEffect(
		() => async () => {
			try {
				const tasks = await getAllTasks();
				const users = await getAllTrainers();
				if (users) {
					// console.log("Trainers fetched successfully:", users);
					setTrainers(users);
				}
				if (tasks) {
					// console.log("Tasks fetched successfully:", tasks);
					setTasks(tasks);
				}
			} catch (error) {
				console.error("Error fetching tasks or users:", error);
			}
		},
		[]
	);

	useEffect(() => {
		setOptions(
			trainers.map((trainer) => ({
				value: trainer.id,
				label: `${trainer.name}`,
			}))
		);
	}, [trainers]);

	useEffect(() => {
		const upcoming = tasks
			?.filter(
				(task) =>
					new Date(task.session_date).getDate() === new Date().getDate() &&
					new Date(task.session_date).getMonth() === new Date().getMonth() &&
					new Date(task.session_date).getFullYear() === new Date().getFullYear()
			)
			?.filter(
				(task) =>
					new Date(task.session_start_time) >= new Date() &&
					new Date(task.session_start_time) <= new Date().setHours(23, 59, 59)
			)
			?.sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
			?.slice(0, 5);
		
		if (upcoming?.length > 0) {
			sendReminder(upcoming[0]);
		}
		setUpcomingTasks(upcoming);
	}, [tasks]);

	// trainer select change handler
	const handleTrainerChange = async (selectedOption) => {
		const updatedTasks = await getTaskById(selectedOption.value);
		setTasks(updatedTasks);
	};

	return (
		<div className="home-container">
			<Header setView={setView} view={view} setTasks={setTasks} options={options} handleTrainerChange={handleTrainerChange} />
			<div className="calendar-container">
				<div className="user-sidebar">
					<Calendar onChange={setSelectedDate} value={selectedDate} />
					<div
						className="session-management"
						style={{ display: user?.admin == 0 ? "block" : "none" }}
						onClick={() => navigate("/home/session")}
					>
						Session Management
					</div>
					<div
						className="past-sessions"
						onClick={() => navigate("/home/past-sessions")}
					>
						Past Sessions
					</div>

					{user && user.admin == 0 ? (
						<div className="upcoming-tasks">
							<h3>Upcoming Tasks</h3>
							<ul>
								{upcomingTasks.length > 0 ? (
									<li key={upcomingTasks[0]._id} className="task-item">
										<div className="task-info">
											<div className="task-title">
												{upcomingTasks[0].course_name}
											</div>
											<div className="task-time">
												{new Date(
													upcomingTasks[0].session_start_time
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
												{" - "}
												{new Date(
													upcomingTasks[0].session_end_time
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										</div>
										<div className="task-date">
											{new Date(
												upcomingTasks[0].session_date
											).toLocaleDateString()}
										</div>
									</li>
								) : (
									<li>No upcoming tasks</li>
								)}
							</ul>
						</div>
					) : (
						<div className="admin-info">
							<h3>Trainers</h3>
							<div
								className="register-trainer"
								onClick={() => navigate("/home/register-trainer")}
							>
								Add Trainer/Admin
							</div>
						</div>
					)}
				</div>
				<div className="calendar">
					<Outlet context={{ selectedDate, tasks }} />
				</div>
			</div>
		</div>
	);
};

export default Home;
