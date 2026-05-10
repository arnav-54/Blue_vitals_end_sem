import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
} from '@mui/icons-material';
import Logo from './Logo';

const Navbar = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
    handleProfileMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getPortalPath = () => {
    if (!user) return '/';
    const role = user.role?.toUpperCase();
    if (role === 'DOCTOR') return '/doctor-portal';
    if (role === 'HOSPITAL') return '/hospital-portal';
    if (role === 'ADMIN') return '/admin-portal';
    return '/user-portal';
  };

  const getMenuItems = () => {
    const items = [
      { text: 'Home', path: '/' },
      { text: 'Doctors', path: '/doctors' },
      { text: 'Hospitals', path: '/hospitals' },
    ];

    if (user) {
      items.push({ text: 'Dashboard', path: getPortalPath() });
    } else {
      items.push({ text: 'Services', path: '/services' });
    }

    items.push({ text: 'Emergency', path: '/emergency' });
    return items;
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              color: item.text === 'Emergency' ? 'error.main' : 'text.primary',
              fontWeight: item.text === 'Emergency' ? 600 : 400,
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {!user && (
          <>
            <ListItem key="login" component={Link} to="/login" onClick={handleDrawerToggle}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem key="register" component={Link} to="/register" onClick={handleDrawerToggle}>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(77, 182, 226, 0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            component={Link}
            to={getPortalPath()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 4,
            }}
          >
            <Logo width={isMobile ? 120 : 168} height={isMobile ? 40 : 56} />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{
                    mx: 1,
                    color: item.text === 'Emergency' ? 'error.main' : 'text.primary',
                    fontWeight: item.text === 'Emergency' ? 600 : 500,
                    '&:hover': {
                      backgroundColor: item.text === 'Emergency' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(77, 182, 226, 0.08)',
                      color: item.text === 'Emergency' ? 'error.main' : 'text.primary',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {!isMobile && (
                  <Button
                    component={Link}
                    to={getPortalPath()}
                    variant="contained"
                    startIcon={<Dashboard />}
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                      '&:hover': { backgroundColor: '#2563eb' },
                    }}
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  onClick={handleProfileMenuOpen}
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4DB6E2, #3A9BC1)' }}>
                      <AccountCircle />
                    </Avatar>
                  }
                  sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 500 }}
                >
                  {!isMobile && `Hi, ${user.name}`}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{ sx: { mt: 1, borderRadius: 2, boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)' } }}
                >
                  <MenuItem component={Link} to={getPortalPath()} onClick={handleProfileMenuClose}>
                    <Dashboard sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#3b82f6',
                      border: '1px solid #dbeafe',
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 5,
                      py: 1,
                      fontSize: '0.95rem',
                      '&:hover': {
                        border: '1px solid #3b82f6',
                        backgroundColor: '#eff6ff',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 5,
                      py: 1,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )
            )}

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;