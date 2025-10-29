import express, { Request, Response } from 'express';
import { database } from './db/database';
import { hashPassword, verifyPassword } from './utils/auth';

const port = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json());

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const renderLandingPage = (): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authentication Playground</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #1f2933;
        background-color: #f8fafc;
      }
      body {
        margin: 0;
        padding: 2rem;
        display: flex;
        justify-content: center;
      }
      main {
        max-width: 720px;
        width: 100%;
        display: grid;
        gap: 2rem;
      }
      section {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
        padding: 1.5rem;
      }
      h1 {
        margin-top: 0;
      }
      form {
        display: grid;
        gap: 0.75rem;
      }
      label {
        display: grid;
        gap: 0.25rem;
        font-weight: 600;
      }
      input {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        font-size: 1rem;
      }
      button {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-radius: 8px;
        border: none;
        background-color: #2563eb;
        color: white;
        cursor: pointer;
      }
      button:hover {
        background-color: #1d4ed8;
      }
      .message {
        min-height: 1.5rem;
        color: #0b7285;
        font-weight: 600;
      }
      .error {
        color: #d14343;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>Testing Playground</h1>
        <p>Use the forms below to sign up, log in, and load dashboard data.</p>
      </section>
      <section>
        <h2>Sign up</h2>
        <form id="signup-form">
          <label>
            Name
            <input data-testid="signup-name" id="signup-name" name="name" required />
          </label>
          <label>
            Email
            <input data-testid="signup-email" id="signup-email" type="email" name="email" required />
          </label>
          <label>
            Password
            <input data-testid="signup-password" id="signup-password" type="password" name="password" required />
          </label>
          <button data-testid="signup-submit" type="submit">Create account</button>
        </form>
        <p class="message" data-testid="signup-message" id="signup-message"></p>
      </section>
      <section>
        <h2>Log in</h2>
        <form id="login-form">
          <label>
            Email
            <input data-testid="login-email" id="login-email" type="email" name="email" required />
          </label>
          <label>
            Password
            <input data-testid="login-password" id="login-password" type="password" name="password" required />
          </label>
          <button data-testid="login-submit" type="submit">Log in</button>
        </form>
        <p class="message" data-testid="login-message" id="login-message"></p>
      </section>
      <section>
        <h2>Dashboard</h2>
        <button data-testid="dashboard-button" id="dashboard-button" type="button">View dashboard</button>
        <p class="message" data-testid="dashboard-message" id="dashboard-message"></p>
      </section>
    </main>
    <script>
      (() => {
        const signupForm = document.getElementById('signup-form');
        const loginForm = document.getElementById('login-form');
        const dashboardButton = document.getElementById('dashboard-button');
        const signupMessage = document.getElementById('signup-message');
        const loginMessage = document.getElementById('login-message');
        const dashboardMessage = document.getElementById('dashboard-message');
        const signupNameInput = document.getElementById('signup-name');
        const signupEmailInput = document.getElementById('signup-email');
        const signupPasswordInput = document.getElementById('signup-password');
        const loginEmailInput = document.getElementById('login-email');
        const loginPasswordInput = document.getElementById('login-password');

        let authToken = '';

        const postJson = async (url, payload) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
          }
          return data;
        };

        const handleError = (target, error) => {
          target.classList.add('error');
          target.textContent = error instanceof Error ? error.message : 'Something went wrong';
        };

        signupForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          signupMessage.classList.remove('error');
          signupMessage.textContent = '';
          try {
            const payload = {
              name: signupNameInput.value.trim(),
              email: signupEmailInput.value.trim(),
              password: signupPasswordInput.value
            };
            const data = await postJson('/api/signup', payload);
            authToken = data.token;
            signupMessage.textContent = 'Account created for ' + data.user.name;
          } catch (error) {
            handleError(signupMessage, error);
          }
        });

        loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          loginMessage.classList.remove('error');
          loginMessage.textContent = '';
          try {
            const payload = {
              email: loginEmailInput.value.trim(),
              password: loginPasswordInput.value
            };
            const data = await postJson('/api/login', payload);
            authToken = data.token;
            loginMessage.textContent = 'Welcome back, ' + data.user.name;
          } catch (error) {
            handleError(loginMessage, error);
          }
        });

        dashboardButton.addEventListener('click', async () => {
          dashboardMessage.classList.remove('error');
          dashboardMessage.textContent = '';
          if (!authToken) {
            dashboardMessage.classList.add('error');
            dashboardMessage.textContent = 'Please log in to view the dashboard.';
            return;
          }
          try {
            const response = await fetch('/api/dashboard', {
              headers: {
                Authorization: 'Bearer ' + authToken
              }
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || 'Unable to load dashboard.');
            }
            dashboardMessage.textContent = data.message;
          } catch (error) {
            handleError(dashboardMessage, error);
          }
        });
      })();
    </script>
  </body>
</html>`;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderLandingPage());
});

type SignupRequestBody = {
  name?: string;
  email?: string;
  password?: string;
};

app.post('/api/signup', (req: Request<unknown, unknown, SignupRequestBody>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  if (database.getUserByEmail(normalizedEmail)) {
    res.status(409).json({ error: 'An account with that email already exists.' });
    return;
  }

  const user = database.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password)
  });

  const token = database.createSession(user.id);

  res.status(201).json({
    message: 'Account created',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

type LoginRequestBody = {
  email?: string;
  password?: string;
};

app.post('/api/login', (req: Request<unknown, unknown, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = database.getUserByEmail(normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const token = database.createSession(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.get('/api/dashboard', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Authorization token is required.' });
    return;
  }

  const token = authHeader.slice('bearer '.length).trim();
  const session = database.getSession(token);

  if (!session) {
    res.status(401).json({ error: 'Session not found.' });
    return;
  }

  const user = database.getUserById(session.userId);

  if (!user) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }

  res.json({
    message: `Dashboard ready for ${user.name}`,
    stats: {
      lastLogin: session.createdAt,
      projects: 3,
      notifications: 1
    }
  });
});

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
export { server };
