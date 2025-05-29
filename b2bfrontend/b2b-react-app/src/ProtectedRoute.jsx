import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("jwt_token"); // Check stored token
  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
