import { LoginClientView } from '../AuthClientPages';

export const metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return <LoginClientView demoMode={process.env.AUTH_MODE !== 'live'} />;
}
