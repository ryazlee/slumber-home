import Home from '../Home';

/** Canonical root — marketing home for everyone (feed CTA when signed in). */
export default function IndexRoute() {
  return <Home />;
}

/** Keep /home working for About / old links. */
export function HomeAliasRoute() {
  return <Home />;
}
