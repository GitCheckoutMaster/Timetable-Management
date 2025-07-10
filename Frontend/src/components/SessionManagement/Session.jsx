import { useOutletContext } from "react-router-dom";
import "./SessionStyle.css";
import { useEffect, useState } from "react";
import { createSession, getAllSessions, updateSessionById } from "../../api";

function isToday(date) {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

const Session = () => {
	const { tasks } = useOutletContext();
	const [upcomingTask, setUpcomingTask] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [ongoingSession, setOngoingSession] = useState(null);

	const [isButtonDisabled, setIsButtonDisabled] = useState(true);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [timerRunning, setTimerRunning] = useState(false);

	// Fetch sessions from DB
	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await getAllSessions();
				setSessions(response);
			} catch (error) {
				console.error("Failed to fetch sessions:", error);
			}
		};
		fetchSessions();
	}, []);

	// Find today's upcoming task
	useEffect(() => {
		const filteredTasks = tasks
			?.filter((t) => {
				const sessionDate = new Date(t.session_date);
				if (!isToday(sessionDate)) return false;

				const alreadyStarted = sessions.find(
					(session) => session.task_id === t.id
				);
				if (alreadyStarted?.session_end) return false;

				const startTime = new Date(t.session_start_time);
				const endTime = new Date(t.session_end_time);
				const duration = (endTime - startTime) / (1000 * 60);
				const diff = (endTime - new Date()) / (1000 * 60);

				return diff >= 0 && diff <= 60 + duration;
			})
			.sort(
				(a, b) =>
					new Date(a.session_start_time) - new Date(b.session_start_time)
			);

		setUpcomingTask(filteredTasks?.[0] || null);
		console.log("Upcoming Task:", filteredTasks?.[0] || "None");
	}, [tasks, sessions]);

	// Find ongoing session
	useEffect(() => {
		if (!sessions || !upcomingTask) {
			setOngoingSession(null);
			return;
		}
		const ongoing = sessions.find(
			(s) => s.task_id === upcomingTask.id && !s.session_end
		);
		setOngoingSession(ongoing || null);
		setTimerRunning(ongoing);
		const localSessionStart = new Date(ongoing?.session_start);
		const diffSeconds =
			(new Date().getTime() - localSessionStart.getTime()) / 1000;
		setElapsedTime(Math.floor(diffSeconds));
	}, [sessions, upcomingTask]);

	// Interval to manage button enable/disable
	useEffect(() => {
		const interval = setInterval(() => {
			if (!upcomingTask) {
				setIsButtonDisabled(true);
				return;
			}

			const now = new Date();
			const startTime = new Date(upcomingTask.session_start_time);
			const endTime = new Date(upcomingTask.session_end_time);

			if (now >= endTime) {
				setIsButtonDisabled(true);
				setTimerRunning(false);
			} else if (ongoingSession) {
				setIsButtonDisabled(false);
			} else if (now >= startTime) {
				setIsButtonDisabled(false);
			} else {
				setIsButtonDisabled(true);
				setTimerRunning(false);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [upcomingTask, ongoingSession]);

	// Stopwatch counter
	useEffect(() => {
		let timer;
		if (timerRunning) {
			timer = setInterval(() => {
				setElapsedTime((prev) => prev + 1);
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [timerRunning]);

	// Toggle button click
	const toggleSession = async () => {
		if (!upcomingTask) return;

		const now = new Date();
		const tzoffset = now.getTimezoneOffset() * 60000;
		const localISOTime = new Date(now - tzoffset)
			.toISOString()
			.slice(0, 19)
			.replace("T", " ");

		if (!ongoingSession) {
			// Start session
			const sessionData = {
				task_id: upcomingTask.id,
				session_start: localISOTime,
				trainer_id: upcomingTask.trainer_id,
			};

			try {
				const res = await createSession(sessionData);
				// Convert from "YYYY-MM-DD HH:mm:ss" to local time
				if (res?.statusCode === 201) {
					console.log("Session started.");
					setOngoingSession(res.data);
					setSessions((prev) => [...prev, res.data]);

					const localSessionStart = new Date(res.data.session_start);
					const diffSeconds =
						(new Date().getTime() - localSessionStart.getTime()) / 1000;
					setElapsedTime(Math.floor(diffSeconds));
					setTimerRunning(true);
				}
			} catch (err) {
				console.error("Failed to start session:", err);
			}
		} else {
			// Stop session
			try {
				const res = await updateSessionById(ongoingSession.id, {
					session_end: localISOTime,
				});
				if (res?.statusCode === 200) {
					console.log("Session stopped.");
					setOngoingSession(null);
					setSessions((prev) =>
						prev.map((s) =>
							s.id === ongoingSession.id
								? { ...s, session_end: localISOTime }
								: s
						)
					);
					setElapsedTime(0);
					setIsButtonDisabled(true);
					setTimerRunning(false);
				}
			} catch (err) {
				console.error("Failed to stop session:", err);
			}
		}
	};

	// Format stopwatch time
	const formatTime = (seconds) => {
		const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
		const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
		const secs = String(seconds % 60).padStart(2, "0");
		return `${hrs}:${mins}:${secs}`;
	};

	return (
		<div className="session-container">
			<div className="session-left">
				{upcomingTask ? (
					<div className="session-card">
						<h2>{upcomingTask.course_name}</h2>
						<p>
							<strong>Trainer ID:</strong> {upcomingTask.trainer_id}
						</p>
						<p>
							<strong>Date:</strong>{" "}
							{new Date(upcomingTask.session_date).toLocaleDateString()}
						</p>
						<p>
							<strong>Time:</strong>{" "}
							{new Date(upcomingTask.session_start_time).toLocaleTimeString()} -{" "}
							{new Date(upcomingTask.session_end_time).toLocaleTimeString()}
						</p>
						<p>
							<strong>Location:</strong> {upcomingTask.location}
						</p>

						<div className="stopwatch-display">⏱ {formatTime(elapsedTime)}</div>

						<div className="session-buttons">
							<button
								className={`session-btn ${isButtonDisabled ? "disabled" : ""}`}
								disabled={isButtonDisabled}
								onClick={toggleSession}
							>
								{timerRunning
									? `⏱ ${formatTime(elapsedTime)} (Click to stop)`
									: "Start Session"}
							</button>
						</div>
					</div>
				) : (
					<div className="session-card">
						<h3>No upcoming sessions</h3>
					</div>
				)}
			</div>

			<div className="session-right">
				<h3>Past Sessions</h3>
				<div className="past-session-list">
					{sessions?.length > 0 ? (
						sessions.map((session, index) => (
							<div key={index} className="past-session-item">
								<p>
									<strong>Session ID:</strong> {session.id}
								</p>
								<p>
									<strong>Trainer:</strong> {session.trainer_id}
								</p>
								<p>
									<strong>Date:</strong>{" "}
									{new Date(session.session_start).toLocaleDateString()}
								</p>
								<div className="time-row">
									<p>
										<strong>Start:</strong>{" "}
										{new Date(session.session_start).toLocaleTimeString()}
									</p>
									<p>
										<strong>End:</strong>{" "}
										{session.session_end
											? new Date(session.session_end).toLocaleTimeString()
											: "—"}
									</p>
								</div>
								<p>
									<strong>Task ID:</strong> {session.task_id}
								</p>
							</div>
						))
					) : (
						<p>No past sessions yet.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Session;
