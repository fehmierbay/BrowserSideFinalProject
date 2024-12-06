import React, { useState } from 'react';
import LoginPage, { Username, Password, TitleSignup, TitleLogin, Submit, Title } from '@react-login-page/page8';
import TicTacToe from './TicTacToe';

const styles = { height: 690 };

interface User {
  uid: number;
  email: string;
  lastseen: number;
  gid: number | null;
}

const Login: React.FC = (props: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<'login' | 'lobby'>('login');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const requestBody = {
      email,
      pass: password,
    };

    try {
      const response = await fetch('http://localhost:12380/login.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        const user = {
          uid: data.user.uid,
          email: data.user.email,
          lastseen: data.user.lastseen,
          gid: null,
        };

        localStorage.setItem('user', JSON.stringify(user));
        setView('lobby');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Communication with the server failed. Check console for details.');
      console.error(error);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const requestBody = {
      email,
      pass: password,
    };

    try {
      const response = await fetch('http://localhost:12380/register.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Communication with the server failed. Check console for details.');
      console.error(error);
    }
  };

  return (
    <div style={styles}>
      {view === 'login' ? (
        <LoginPage>
          <Title />
          <TitleSignup>Sign up</TitleSignup>
          <TitleLogin>Login</TitleLogin>

          <Username
            label="Email"
            placeholder="Please input email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            label="Password"
            placeholder="Please enter password"
            name="userPassword"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Submit keyname="submit" onClick={handleLogin}>
            Login
          </Submit>

          <Submit keyname="reset">Reset</Submit>

          <Username
            panel="signup"
            label="Email"
            placeholder="E-mail"
            keyname="e-mail"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            panel="signup"
            label="Password"
            placeholder="Please enter password"
            keyname="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Password
            panel="signup"
            label="Confirm Password"
            placeholder="Confirm password"
            keyname="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Submit panel="signup" keyname="signup-submit" onClick={handleRegister}>
            Sign up
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

export default Login;
