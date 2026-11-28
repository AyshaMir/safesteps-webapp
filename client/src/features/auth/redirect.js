// Where to go after login / signup: the screen the person came from, or Home.
export function returnPath(location) {
  const from = location.state?.from;
  if (!from?.pathname || ['/login', '/signup'].includes(from.pathname)) return '/';
  return from.pathname + (from.search || '') + (from.hash || '');
}
