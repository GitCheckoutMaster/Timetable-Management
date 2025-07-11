import { useEffect, useState } from "react";
import { deleteBatch, getAllBatches } from "../../api.js";
import Select from "react-select";
import "./RemoveBatchStyle.css";

const RemoveBatch = () => {
	const [batchCode, setBatchCode] = useState("");
	const [message, setMessage] = useState("");
	const [batchOptions, setBatchOptions] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

	const selectStyles = {
		control: (provided, state) => ({
			...provided,
			background: "#ffffff",
			borderColor: "#f5b7b1",
			borderRadius: "15px",
			boxShadow: state.isFocused
				? "0 0 0 2px rgba(245, 183, 177, 0.5)"
				: "0 4px 12px rgba(0,0,0,0.05)",
			padding: "4px 8px",
			"&:hover": {
				borderColor: "#c0392b",
			},
		}),
		option: (provided, state) => ({
			...provided,
			background: state.isFocused
				? "#fdecea"
				: state.isSelected
				? "#f5b7b1"
				: "#ffffff",
			color: state.isSelected ? "#fff" : "#c0392b",
			cursor: "pointer",
			fontSize: "14px",
			"&:active": {
				background: "#f5b7b1",
				color: "#fff",
			},
		}),
		menu: (provided) => ({
			...provided,
			borderRadius: "15px",
			overflow: "hidden",
			boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
		}),
		singleValue: (provided) => ({
			...provided,
			color: "#c0392b",
			fontWeight: 500,
		}),
		placeholder: (provided) => ({
			...provided,
			color: "#888",
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: "#f5b7b1",
			"&:hover": {
				color: "#c0392b",
			},
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
	};

	useEffect(() => {
		const fetchBatches = async () => {
			const res = await getAllBatches();
			if (res?.statusCode === 200) {
				const options = res.data.map((batch) => ({
					value: batch.batch_code,
					label: `${batch.batch_code} - ${batch.batch_name}`,
				}));
				setBatchOptions(options);
			}
		};
		fetchBatches();
	}, []);

  if (user?.admin !== 1) {
    return <div className="not-authorized">You are not authorized to remove batches.</div>;
  }

	const handleDelete = async (e) => {
		e.preventDefault();
		const res = await deleteBatch(batchCode);
		if (res?.statusCode === 200) {
			setMessage("Batch deleted successfully!");
			setBatchCode("");
		} else {
			setMessage(res?.msg || "Failed to delete batch");
		}
	};

	return (
		<div className="remove-batch-container">
			<h2>Remove Batch</h2>
			<form onSubmit={handleDelete} className="remove-batch-form">
				<Select
					options={batchOptions}
					styles={selectStyles}
					placeholder="Select a batch"
					value={
						batchOptions.find((option) => option.value === batchCode) || null
					}
					onChange={(selectedOption) => setBatchCode(selectedOption?.value)}
					required
				/>
				<button type="submit">Remove Batch</button>
			</form>
			{message && <p className="remove-batch-message">{message}</p>}
		</div>
	);
};

export default RemoveBatch;
