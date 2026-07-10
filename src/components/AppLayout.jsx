import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardProvider } from "../context/DashboardContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import "../App.css";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const contentArea = document.querySelector(".content-area");
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
  }, [location.pathname, location.search, location.hash]);

  return (
    <DashboardProvider>
    <div className="app-wrapper">
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="main-content">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="content-area">
            {children ?? <Outlet />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </DashboardProvider>
  );
}
