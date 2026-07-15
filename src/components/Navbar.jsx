import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="brand-dot" />
        status<span className="brand-code">.explorer</span>
      </NavLink>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          dashboard
        </NavLink>
        <NavLink to="/explorer" className={({ isActive }) => (isActive ? "active" : "")}>
          explorer
        </NavLink>
        <NavLink to="/tester" className={({ isActive }) => (isActive ? "active" : "")}>
          api-tester
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => (isActive ? "active" : "")}>
          favorites
        </NavLink>
      </nav>
    </header>
  );
}
