import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    // get token from localStorage 
    const token = localStorage.getItem("token");

    // if DONT HAVE token£¬redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // if HAVE token£¬render the child
    return children;
}

export default ProtectedRoute;