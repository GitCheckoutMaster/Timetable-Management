/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import './TaskCardStyle.css';

const TaskCard = ( { taskDetails, widthOffset } ) =>{
  const [height, setHeight] = useState(0);
  const [top, setTop] = useState(0);
  const colors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#8E44AD', // Purple
    '#E67E22', // Orange
    '#2ECC71', // Light Green
    '#3498DB', // Light Blue
    '#585dfb', // Light Purple
  ]
  
  useEffect(() => {
    const startTime = new Date(taskDetails?.session_start_time);
    const endTime = new Date( taskDetails?.session_end_time);

    const diffMs = endTime - startTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60)); // converting milliseconds to minutes
    setHeight(1.37 * diffMinutes);

    // Calculate the top position based on the start time
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    setTop((startHour * 60 + startMinutes) * 1.35);

  }, [taskDetails]);

  if (!taskDetails) {
    return <div></div>;
  }

  return (
    <div className='card-container' style={{ height: `${height}px`, top: `${top}px`, width: `${1105-widthOffset}px`, backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}>
      Lecture of {taskDetails.course_name} at {taskDetails.location}
    </div>
  )
}

export default TaskCard;