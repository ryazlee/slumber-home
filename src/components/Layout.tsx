import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner content-wrap">
          <span>© {new Date().getFullYear()} Slumber</span>
          <NavLink to="/download">Download</NavLink>
          <NavLink to="/privacy">Privacy Policy</NavLink>
          <NavLink to="/terms">Terms of Service</NavLink>
          <NavLink to="/delete-account">Delete account</NavLink>
          <NavLink to="/delete-data">Delete data</NavLink>
          <a href="mailto:useslumber@gmail.com">useslumber@gmail.com</a>
        </div>
      </footer>
    </>
  );
}
