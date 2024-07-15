import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeleteStudent = ({ id, fetchStudents }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            axios.delete(`http://localhost:3001/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    console.log(res);
                    // Optionally update state or trigger a refresh
                    fetchStudents(); // Call the parent function to refresh student list
                })
                .catch(err => console.error(err));
        }
    };

    return (
        <button className="btn btn-danger ms-2" onClick={handleDelete}>
            Delete
        </button>
    );
};

export default DeleteStudent;
