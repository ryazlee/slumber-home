import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIsModerator } from '../hooks/useAdmin';
import {
  ADMIN_NAV_ITEM,
  isNavActive,
  MAIN_NAV_ITEMS,
  type PrimaryNavItem,
} from '../lib/appNav';

function bottomTabClass(active: boolean) {
  return active ? 'app-bottom-tab active' : 'app-bottom-tab';
}

export function useBottomNavItems(): PrimaryNavItem[] {
  const { session } = useAuth();
  const moderatorQuery = useIsModerator(Boolean(session));
  const items = [...MAIN_NAV_ITEMS];
  if (moderatorQuery.data === true) {
    items.push(ADMIN_NAV_ITEM);
  }
  return items;
}

export function usePrimaryNavItems(): PrimaryNavItem[] {
  const { session } = useAuth();
  const moderatorQuery = useIsModerator(Boolean(session));
  if (moderatorQuery.data === true) {
    return [...MAIN_NAV_ITEMS, ADMIN_NAV_ITEM];
  }
  return MAIN_NAV_ITEMS;
}

export default function AppBottomNav({ items }: { items: PrimaryNavItem[] }) {
  const location = useLocation();

  return (
    <nav className="app-bottom-nav" aria-label="Main">
      {items.map((item) => {
        const active = isNavActive(location.pathname, item);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={bottomTabClass(active)}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
