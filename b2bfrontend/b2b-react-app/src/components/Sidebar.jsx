import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber} from '../utils/translator';
import("./Sidebar.css");

const Sidebar = ({ setActivePage }) => { // ✅ Accept setActivePage from parent


  const [links, setLinks] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // Sidebar open by default
  const token = localStorage.getItem("authToken");

  useEffect(() => {
	 
    if (!token) return; // Ensure user is logged in

    const fetchLinks = async () => {
      try {
        const response = await axiosInstance.get("/api/navigation/");
        setLinks(response.data.links); // Store fetched links
      } catch (error) {
        console.error("Error fetching navigation links:", error);
      }
    };

    fetchLinks();
     document.body.classList.toggle("rtl", isRTL());

    
  }, [getCurrentLanguage(),token]);

  return (
    
    <div className={`sidebar ${isOpen ? "open" : "closed"} ${isRTL() ? "rtl" : ""}` }>


      <nav className="sidebar-nav">
        {links.map((link) => (
		<a className="sidebar-item" href="#" onClick={() => setActivePage(link.url)}
>{t(link.name)}</a>
         
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
