import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const RootLayout = () => {
  return (
    // <div>
      // <div className="root-layout">
      <div className="container">
      <Navbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
