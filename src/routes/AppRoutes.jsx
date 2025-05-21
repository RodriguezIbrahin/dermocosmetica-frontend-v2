import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../pages/SignIn";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Users from "../pages/Users";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/users" element={<Users />} />
      <Route path="/" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
