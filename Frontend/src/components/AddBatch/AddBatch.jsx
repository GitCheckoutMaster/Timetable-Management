import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBatch } from '../../api.js';
import './AddBatchStyle.css';

const AddBatch = () => {
  const [batchCode, setBatchCode] = useState('');
  const [batchName, setBatchName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.admin !== 1) {
    return <div className="not-authorized">You are not authorized to add batches.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await addBatch({ batch_code: batchCode, batch_name: batchName });
    if (res?.statusCode === 201) {
      setMessage("Batch added successfully!");
      setBatchCode('');
      setBatchName('');
    } else {
      setMessage(res?.msg || "Failed to add batch");
    }
  };

  return (
    <div className="add-batch-container">
      <h2>Add Batch</h2>
      <form onSubmit={handleSubmit} className="add-batch-form">
        <input
          type="text"
          value={batchCode}
          onChange={(e) => setBatchCode(e.target.value)}
          placeholder="Batch Code"
          required
        />
        <input
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Batch Name"
          required
        />
        <button type="submit">Add Batch</button>
      </form>
      {message && <p className="add-batch-message">{message}</p>}

      <button 
        className="go-remove-batch"
        onClick={() => navigate('/home/remove-batch')}
      >
        Remove Batch
      </button>
    </div>
  );
};

export default AddBatch;
