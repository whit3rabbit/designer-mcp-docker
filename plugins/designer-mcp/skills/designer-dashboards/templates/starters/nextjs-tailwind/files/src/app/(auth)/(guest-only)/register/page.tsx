import { RegisterClientView } from '../AuthClientPages';

export const metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return <RegisterClientView demoMode={process.env.AUTH_MODE !== 'live'} />;
}
