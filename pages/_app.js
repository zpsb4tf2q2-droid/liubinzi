import { env } from '../lib/env.mjs';

export default function App({ Component, pageProps }) {
  // Touch the env to ensure the import side-effects run on both server and client
  void env;
  return <Component {...pageProps} />;
}
