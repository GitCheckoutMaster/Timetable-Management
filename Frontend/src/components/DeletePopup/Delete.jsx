import './DeleteStyle.css';
import Popup from 'reactjs-popup';
import { IoClose } from 'react-icons/io5';
import { deleteTask } from '../../api.js';

const Delete = ({ open, setOpen, taskId }) => {
  
  const handleDelete = async () => {
    const res = await deleteTask(taskId);
    if (res?.statusCode === 200) {
      console.log("Task deleted successfully");
      setOpen(false);
      window.location.reload(); // Reload the page to reflect changes
    } else {
      console.error("Failed to delete task: ", res?.message || "Unknown error");
    }
  }

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      modal
      overlayClassName="delete-overlay"
      contentStyle={{ width: '400px', borderRadius: '12px' }}
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
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="delete-actions">
          <button className="delete-confirm" onClick={handleDelete}>
            Yes, Delete
          </button>
          <button className="delete-cancel" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default Delete;
