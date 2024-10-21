import React from 'react';
import { Navigate } from 'react-router-dom';

// This component checks if the user is authenticated before allowing access
const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/" />;
    }
    // Otherwise, render the child components (the protected route content)
    return children;
};

export default ProtectedRoute;
