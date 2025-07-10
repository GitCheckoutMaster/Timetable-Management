import { useEffect, useState } from 'react';
import './PastSessionsStyle.css';
import { getAllSessions } from '../../api';
import { useOutletContext } from 'react-router-dom';

const PastSessions = () => {
  const { tasks } = useOutletContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await getAllSessions();
      if (res) {
        const sessionsWithTasks = res.map((session) => {
          const task = tasks.find((task) => task.id === session.task_id && session.trainer_id === user.id);
          return {
            ...session,
            course_name: task?.course_name,
            location: task?.location,
          };
        });
        sessionsWithTasks.sort((a, b) => new Date(b.session_start) - new Date(a.session_start));
        setSessions(sessionsWithTasks);
      }
      setLoading(false);
    };
    fetchSessions();
  }, [ tasks, user ]);

  return (
    <div className="past-sessions-container">
      <h2>Past Sessions</h2>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="sessions-grid">
          {sessions.length === 0 ? (
            <p className="no-sessions">No past sessions found.</p>
          ) : (
            sessions.map((session, index) => (
              <div className="session-card" key={index}>
                <h3>{session.course_name}</h3>
                <p><strong>Date:</strong> {session.session_start?.split(" ")[0]}</p>
                <p><strong>Started at:</strong> {session.session_start?.split(" ")[1]}</p>
                <p><strong>Ended at:</strong> {session.session_end?.split(" ")[1]}</p>
                {session.location && (
                  <p><strong>Location:</strong> {session.location}</p>
                )}
                <p className={`status ${session.session_end ? `completed` : `incomplete`}`}>Session {session.session_end ? `completed` : `incomplete`}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PastSessions;
