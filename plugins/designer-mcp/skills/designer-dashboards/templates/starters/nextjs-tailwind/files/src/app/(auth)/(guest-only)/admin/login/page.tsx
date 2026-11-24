import { AdminLoginClientView } from '../../AuthClientPages';

export const metadata = {
  title: 'Administrator Sign In',
};

export default function AdminLoginPage() {
  return <AdminLoginClientView demoMode={process.env.AUTH_MODE !== 'live'} />;
}
