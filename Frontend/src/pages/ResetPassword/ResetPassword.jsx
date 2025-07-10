import './ResetPasswordStyle.css';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { resetPassword } from '../../api.js';

const ResetPassword = () => {
  const { token } = useParams();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const res = await resetPassword(token, data.password);

    if (res?.statusCode === 200) {
      setError(null);
      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res?.msg || "Failed to reset password.");
    }
  };

  return (
    <div className="reset-container-main">
      <div className="reset-container">
        <h2 className="reset-heading">Create New Password</h2>
        {error && <div className="reset-error">{error}</div>}
        {success && <div className="reset-success">{success}</div>}
        <form className="reset-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="reset-inp">
            <label>New Password</label>
            <input {...register("password", { required: true })} type="password" />
          </div>
          <div className="reset-inp">
            <label>Confirm Password</label>
            <input {...register("confirmPassword", { required: true })} type="password" />
          </div>
          <button type="submit" className="reset-submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
