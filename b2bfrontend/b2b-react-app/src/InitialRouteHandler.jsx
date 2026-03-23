import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "./components/axiosInstance";

const InitialRouteHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent running multiple times (especially in Strict Mode)
    if (hasRun.current) return;
    hasRun.current = true;


      console.log("InitialRouteHandler: Checking initial route...");
      console.log("Current pathname:", location.pathname);
      console.log("Is authenticated:", isAuthenticated());
      
      if (isAuthenticated()) {
        const mainUrl = localStorage.getItem("main_url");
        console.log("Stored main_url:", mainUrl);
        
        // If there's a stored main_url and user is on root, redirect to it
        if (location.pathname === "/") {
          const normalized = typeof mainUrl === "string" ? mainUrl.trim().toLowerCase() : "";

          // Stay on landing page when main_url is null/empty or literally contains "null"
          const shouldStayOnLanding =
            !normalized ||
            normalized === "/" ||
            normalized === "null" ||
            normalized.includes("null");

          if (!shouldStayOnLanding) {
            console.log("Redirecting to:", "/admin");
            navigate("/admin", { replace: true });
          } else {
            console.log("Staying on landing page (/)");
          }
        }
      } else {
        console.log("User is not authenticated");
      }


    // Small delay to ensure React Router is ready
    


  }, [location.pathname, navigate]);

  return children;
};

export default InitialRouteHandler;
