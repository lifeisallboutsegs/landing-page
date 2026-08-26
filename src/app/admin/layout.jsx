// Applies to the login page as well as the dashboard. The auth gate lives in
// the (dashboard) route group instead, so /admin/login is reachable without a
// session — gating it here would redirect the login page to itself.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminSegmentLayout({ children }) {
  return children;
}
