import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

interface NavbarProps {
  onLogout: () => void;
  username: string | undefined;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, username }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Welcome to the TicTacToe Game 
        </Typography>
        <Typography variant="body1" style={{ marginRight: '20px' }}>
          Logged in as: {username}
        </Typography>
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
