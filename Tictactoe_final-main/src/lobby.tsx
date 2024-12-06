import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress, ListItemIcon, Paper } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

interface LobbyProps {
  onStartGame: (opponent: User, existingGameId?: string) => void;
}

interface User {
  uid: number;
  email: string;
  lastseen: number;
  gid: number | null;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:12380/session.php', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.loggedInUsers) {
        setUsers(data.loggedInUsers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fade = useSpring({ opacity: loading ? 0 : 1 });

  return (
    <Container>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <GroupIcon sx={{ marginRight: 1 }} />
        Logged-in Users
      </Typography>
  
      {loading ? (
        <CircularProgress />
      ) : (
        <animated.div style={fade}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <List>
              {users.map((user) => (
                <ListItem
                  key={user.uid}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingY: 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={user.email} />
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onStartGame(user)}
                  >
                    Start The Game
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </animated.div>
      )}
    </Container>
  );
  
};

export default Lobby;