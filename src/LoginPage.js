import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setIsAuthenticated }) => {
    const [password, setPassword] = useState('');  // Password state
    const [error, setError] = useState('');        // Error message state
    const [success, setSuccess] = useState('');    // Success message state

    const navigate = useNavigate();

    // Handle input change and update the password state
    const handleChange = (e) => {
        setPassword(e.target.value);  // Update the password state with the input value
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Make the API request to login
            const response = await axios.post('http://13.60.188.226/api/login', { password }, { withCredentials: true });

            if (response.data.success) {
                setSuccess(response.data.message);
                setIsAuthenticated(true);  // Mark user as authenticated
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid password');
            } else {
                setError('An error occurred while logging in');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={styles.title}>Login</h2>

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={handleChange}  // Handle input changes here
                        style={styles.input}
                    />

                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <button type="submit" style={styles.button}>Login</button>
                </form>
            </div>
        </div>
    );
};

// Styles for the page
const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9e2e7', // Cream Pink background
    },
    formContainer: {
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glassy look
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', // Soft shadow
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        marginBottom: '1rem',
        color: '#333',
        fontSize: '2rem',
        fontWeight: 'bold',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    input: {
        width: '300px',
        padding: '10px',
        margin: '10px 0',
        fontSize: '1rem',
        borderRadius: '25px',
        border: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent glassy effect
        backdropFilter: 'blur(10px)', // Adds to glassy look
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        outline: 'none',
        color: '#333',
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    button: {
        width: '200px',
        padding: '10px',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '25px',
        border: 'none',
        backgroundColor: '#ff6f61', // Coral-like color for the button
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    error: {
        color: 'red',
        fontSize: '0.9rem',
        marginTop: '10px',
    },
    success: {
        color: 'green',
        fontSize: '0.9rem',
        marginTop: '10px',
    },
};

export default LoginPage;
