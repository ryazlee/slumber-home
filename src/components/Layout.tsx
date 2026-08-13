import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner content-wrap">
          <span>© {new Date().getFullYear()} Slumber</span>
        </div>
      </footer>
    </>
  );
}
