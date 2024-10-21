import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [keys, setKeys] = useState([]);  // List of keys
    const [newKey, setNewKey] = useState('');  // New key input
    const [error, setError] = useState('');  // Error message

    // Fetch the keys from the server
    const fetchKeys = async () => {
        try {
            const response = await axios.get('http://13.60.188.226/api/keys', { withCredentials: true });
            setKeys(response.data);  // Assuming response.data is the array of keys
        } catch (err) {
            console.error('Error fetching keys:', err);
            setError('Failed to fetch keys');
        }
    };

    // Add a new key by sending it to the server
    const addKey = async () => {
        if (newKey.trim() === '') {
            setError('Key cannot be empty');
            return;
        }

        try {
            const response = await axios.post('http://13.60.188.226/api/generate-key', { key: newKey }, { withCredentials: true });
            setKeys([...keys, response.data]);  // Add the new key to the list (response.data should be the new key)
            setNewKey('');  // Clear the input field
            setError('');  // Clear any previous error
        } catch (err) {
            console.error('Error adding key:', err);
            setError('Failed to add key');
        }
    };

    // Create a random key by requesting the server to generate one
    const createRandomKey = async () => {
        try {
            const response = await axios.post('http://13.60.188.226/api/generate-random-key', {}, { withCredentials: true });
            setKeys([...keys, response.data]);  // Add the random key to the list
            setError('');  // Clear any previous error
        } catch (err) {
            console.error('Error creating random key:', err);
            setError('Failed to create random key');
        }
    };

    // Fetch the keys when the component mounts
    useEffect(() => {
        fetchKeys();
    }, []);

    // Handle form submission for adding a new key
    const handleSubmit = (e) => {
        e.preventDefault();
        addKey();
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Dashboard: Key List</h1>

            {/* Display list of keys */}
            <div style={styles.keyListContainer}>
                <h2 style={styles.subTitle}>Existing Keys</h2>
                {keys.length > 0 ? (
                    <ul style={styles.keyList}>
                        {keys.map((key, index) => (
                            <li key={index} style={styles.keyItem}>
                                {key.key}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No keys available.</p>
                )}
            </div>

            {/* Form to add a new key */}
            <div style={styles.formContainer}>
                <h2 style={styles.subTitle}>Add a New Key</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter new key"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Add Key</button>
                    <button type="button" style={styles.button} onClick={createRandomKey}>Create Random Key</button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

// Basic styles for the page
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '2rem',
    },
    subTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
    },
    keyListContainer: {
        marginBottom: '2rem',
    },
    keyList: {
        listStyleType: 'none',
        padding: 0,
    },
    keyItem: {
        padding: '0.5rem',
        border: '1px solid #ddd',
        marginBottom: '0.5rem',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
    },
    formContainer: {
        marginTop: '2rem',
    },
    form: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
    },
    input: {
        padding: '0.5rem',
        width: '200px',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginTop: '1rem',
    },
};

export default Dashboard;
