import { Redirect } from 'expo-router';

// OAuth exchange remains in its provider; return routing to the session guard.
export default function OAuthCallback() {
  return <Redirect href="/" />;
}
