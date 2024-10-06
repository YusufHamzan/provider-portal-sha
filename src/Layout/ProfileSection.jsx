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
import { CssBaseline, Toolbar, Tooltip, Typography } from "@mui/material";

function stringToColor(string) {
  if (!!string) {
    return
  }
  let hash = 0;

  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string?.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}
const stringAvatar = (name) => {
  if (!name) {
    return ''
  }

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: <Typography sx={{ fontSize: '16px' }}>{`${name?.split(' ')[0][0]}${name?.split(' ')[1]?.[0] || ''}`}</Typography>,
  };
}

export default function ProfileSection({ logout }) {
  const { keycloak } = useKeycloak();
  let email = localStorage.getItem("email");
  let name = localStorage.getItem("provider");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Typography sx={{ display: { xs: 'none', md: 'inline-block' }, color: '#3e2121' }}>{name}</Typography>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} {...stringAvatar(name)} />
          </IconButton>
        </Tooltip>
      </Box>
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
            handleClose()
            keycloak.logout()
            localStorage.clear();
            logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment >
  );
}
