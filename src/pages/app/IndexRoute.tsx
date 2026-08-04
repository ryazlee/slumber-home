import { Navigate, useLocation } from 'react-router-dom';
import Home from '../Home';
import { useAuth } from '../../context/AuthContext';

/** Canonical root: marketing when logged out, feed when signed in. */
export default function IndexRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="home-marketing">
        <p className="app-muted" style={{ padding: '48px 24px', textAlign: 'center' }}>
          Loading…
        </p>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/feed" replace />;
  }

  return <Home />;
}

/** Keep /home for About / bookmarks; send logged-out visitors to canonical /. */
export function HomeAliasRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="home-marketing">
        <p className="app-muted" style={{ padding: '48px 24px', textAlign: 'center' }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={location.state} />;
  }

  return <Home />;
}
