import './DeleteStyle.css';
import Popup from 'reactjs-popup';
import { IoClose } from 'react-icons/io5';
import { useEffect } from 'react';
import { deleteTask, deleteTaskGroup } from '../../api.js'; 

const Delete = ({ open, setOpen, task }) => {

  useEffect(() => {
    console.log("Delete component mounted with task:", task);
  }, [task]);
  const handleDeleteSingle = async () => {
    const res = await deleteTask(task?.id);
    if (res?.statusCode === 200) {
      console.log("Task deleted successfully");
      setOpen(false);
      window.location.reload();
    } else {
      console.error("Failed to delete task: ", res?.message || "Unknown error");
    }
  }

  const handleDeleteGroup = async () => {
    console.log("deleting the group")
    const res = await deleteTaskGroup(task?.repeat_group_id);
    if (res?.statusCode === 200) {
      console.log("Task group deleted successfully");
      setOpen(false);
      window.location.reload();
    } else {
      console.error("Failed to delete task group: ", res?.message || "Unknown error");
    }
  }

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      modal
      overlayClassName="delete-overlay"
      contentStyle={{ width: '420px', borderRadius: '12px' }}
    >
      <div className="delete-container">
        <button
          className="delete-close-button"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <IoClose size={22} />
        </button>
        <h2>Delete Task</h2>
        <p className="delete-task-name">{task?.course_name}</p>

        {task?.repeat_group_id ? (
          <>
            <p className="delete-warning">
              This task is part of a repeating series.
              <br />
              What would you like to do?
            </p>
            <div className="delete-actions-column">
              <button className="delete-confirm" onClick={handleDeleteSingle}>
                Delete Only This Task
              </button>
              <button className="delete-group" onClick={handleDeleteGroup}>
                Delete Entire Series
              </button>
              <button className="delete-cancel" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="delete-warning">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="delete-actions">
              <button className="delete-confirm" onClick={handleDeleteSingle}>
                Yes, Delete
              </button>
              <button className="delete-cancel" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Popup>
  );
};

export default Delete;
