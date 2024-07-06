import toast from "react-hot-toast";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const onLogout = () => {
    localStorage.removeItem(storageKey);

    toast.success("You will navigate to the login page after 1.5 seconds.", {
      position: "bottom-center",
      duration: 1500,
      style: {
        backgroundColor: "black",
        color: "white",
        width: "fit-content",
      },
    });

    setTimeout(() => {
      location.replace(pathname);
    }, 1500);
  };

  return (
    <nav className="px-5 mx-auto mb-10 py-5 rounded-md bg-gray-200">
      <ul className="flex items-center justify-between">
        <li className="text-black duration-200 font-semibold text-lg">
          <NavLink to="/">Home</NavLink>
        </li>
        {userData ? (
          <div className="flex items-center text-indigo-600 space-x-4">
            <li className="duration-200 text-lg">
              <NavLink to="/todos">todos</NavLink>
            </li>
            <li className="duration-200 text-lg">
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <button
              className="bg-indigo-500 text-white px-2 py-1 rounded-md cursor-pointer"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="flex items-center space-x-3">
            <li className="text-black duration-200 font-semibold text-lg">
              <NavLink to="/register">Register</NavLink>
            </li>
            <li className="text-black duration-200 font-semibold text-lg">
              <NavLink to="/login">Login</NavLink>
            </li>
          </p>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
