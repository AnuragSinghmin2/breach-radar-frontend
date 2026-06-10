import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardProvider } from "../context/DashboardContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import "../App.css";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760);

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
