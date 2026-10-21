import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();
  const role = user?.role;
  const isInstructorRoute = location.pathname.startsWith("/instructor");
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (!authenticated && !location.pathname.includes("/auth")) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (authenticated && location.pathname.includes("/auth")) {
    return (
      <Navigate
        to={role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/home"}
        replace
      />
    );
  }

  if (authenticated && isAdminRoute && role !== "admin") {
    return <Navigate to={role === "instructor" ? "/instructor" : "/home"} replace />;
  }

  if (authenticated && isInstructorRoute && role !== "instructor") {
    return <Navigate to={role === "admin" ? "/admin" : "/home"} replace />;
  }

  if (authenticated && role === "admin" && !isAdminRoute) {
    return <Navigate to="/admin" replace />;
  }

  if (authenticated && role === "instructor" && !isInstructorRoute) {
    return <Navigate to="/instructor" replace />;
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
