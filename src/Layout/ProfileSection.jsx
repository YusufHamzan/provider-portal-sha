import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Logout from "@mui/icons-material/Logout";
import { useKeycloak } from "@react-keycloak/web";
import { Email } from "@mui/icons-material";
import { drawerWidth } from './index';
import { CssBaseline, Toolbar } from "@mui/material";

export default function ProfileSection() {
  const { keycloak } = useKeycloak();
  let email = localStorage.getItem("email");
  let name = localStorage.getItem("provider");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Toolbar sx={{ mt: '4px' }}>
      {/* <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={() => handleDrawerOpen()}
        edge="start"
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon sx={{ color: '#000' }} />
      </IconButton> */}
      {/* <Box sx={{ flexGrow: 1 }}>
        <img width={120} src='/icons/logo.png' alt='Logo' />
      </Box> */}

      <Box sx={{ flexGrow: 0 }}>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleClose} sx={{ fontSize: "20px" }}>
            {name}
          </MenuItem>
          <MenuItem
            onClick={handleClose}
            sx={{ color: "gray", fontSize: "13px" }}
          >
            <Email sx={{ width: "15px", margin: "0px 3px" }} />
            {email}
          </MenuItem>
          <Divider />

          <MenuItem
            onClick={() => {
              localStorage.clear();
              keycloak.logout();
            }}
          >
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Toolbar >
  );
}
