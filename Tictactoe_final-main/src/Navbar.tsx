import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

interface HeaderProps {
  onSignOut: () => void;
  userName: string | undefined;
}

const Header: React.FC<HeaderProps> = ({ onSignOut, userName }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Welcome to the Ultimate Tic-Tac-Toe Challenge
        </Typography>
        <Typography variant="body1" style={{ marginRight: '20px' }}>
          Signed in as: {userName}
        </Typography>
        <Button color="inherit" onClick={onSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
