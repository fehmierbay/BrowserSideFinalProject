import React, { useState } from 'react';
import LoginPage, { Username, Password, TitleSignup, TitleLogin, Submit, Title } from '@react-login-page/page8';
import erba from './erba';

const containerStyle = { height: 690 };

interface User {
  id: number;
  emailAddress: string;
  lastSeen: number;
  gameId: number | null;
}

const Authentication: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<'auth' | 'gameLobby'>('auth');

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:12380/login.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        const loggedUser = {
          id: result.user.uid,
          emailAddress: result.user.email,
          lastSeen: result.user.lastseen,
          gameId: null,
        };

        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        setView('gameLobby');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to communicate with the server. Please check console for more details.');
      console.error(error);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const newUser = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:12380/register.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to communicate with the server. Please check console for more details.');
      console.error(error);
    }
  };

  return (
    <div style={containerStyle}>
      {view === 'auth' ? (
        <LoginPage>
          <Title />
          <TitleSignup>Register</TitleSignup>
          <TitleLogin>Login</TitleLogin>

          <Username
            label="Email Address"
            placeholder="Enter your email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            label="Password"
            placeholder="Enter your password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Submit keyname="login-submit" onClick={handleSignIn}>
            Login
          </Submit>

          <Submit keyname="reset">Reset</Submit>

          <Username
            panel="signup"
            label="Email Address"
            placeholder="Enter your email"
            keyname="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            panel="signup"
            label="Password"
            placeholder="Create a password"
            keyname="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Password
            panel="signup"
            label="Confirm Password"
            placeholder="Re-enter password"
            keyname="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Submit panel="signup" keyname="register-submit" onClick={handleSignUp}>
            Register
          </Submit>
          <Submit panel="signup" keyname="signup-reset">
            Reset game
          </Submit>
        </LoginPage>
      ) : (
        <TicTacToe config={{ sizex: 3, sizey: 3 }} />
      )}
    </div>
  );
};

export default Authentication;
