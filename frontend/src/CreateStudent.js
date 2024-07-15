import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateStudent() {
    const [firstname, setFName] = useState('');
    const [lastname, setLName] = useState('');
    const [email, setEmail] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:3001/create', { firstname, lastname, email }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res);
                navigate('/');
            })
            .catch(err => console.log(err));
    }

    return (
        <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
            <div className='w-50 bg-white rounded p-3'>
                <form onSubmit={handleSubmit}>
                    <h2>Add Student</h2>
                    <div className='mb-2'>
                        <label htmlFor="firstname">FirstName</label>
                        <input
                            type="text"
                            placeholder='Enter First Name'
                            className='form-control'
                            value={firstname}
                            onChange={e => setFName(e.target.value)}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="lastname">LastName</label>
                        <input
                            type="text"
                            placeholder='Enter Last Name'
                            className='form-control'
                            value={lastname}
                            onChange={e => setLName(e.target.value)}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            placeholder='Enter Email'
                            className='form-control'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <button className='btn btn-success'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default CreateStudent;
