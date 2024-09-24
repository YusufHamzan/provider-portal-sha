import * as React from 'react';
import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import CategoryIcon from '@mui/icons-material/Category';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AssistantIcon from '@mui/icons-material/Assistant';
import ExpandLess from '@mui/icons-material/ExpandLess';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Collapse from '@mui/material/Collapse';
import { Link } from 'react-router-dom';
import { drawerWidth } from '.';
import Drawer from '@mui/material/Drawer';
import { Box } from '@mui/material';

export const PRIMARY_MAGENTA = '#00539b'
export const PRIMARY_YELLOW = '#8dc63e'
export const PRIMARY_CYAN = '#27aae1'


const Sidebar = ({ open, handleDrawerClose, handleDrawerTransitionEnd }) => {
  const [openSubmenu, setOpenSubmenu] = React.useState(false);
  const [clickedMenu, setClickedMenu] = React.useState(null);
  const [clickeSubdMenu, setClickeSubMenu] = React.useState(null);

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    backgroundColor: '#00539b',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));

  const menuItems = [
    { text: 'Dashboard', icon: <SpaceDashboardIcon />, path: '/' },
    { text: 'Member Eligibility', icon: <PeopleIcon />, path: '/membereligibility' },
    {
      text: 'Claims',
      icon: <CategoryIcon />,
      submenus: [
        { text: 'Pre-Auth', path: '/preauths', icon: <AssistantIcon /> },
        { text: 'Claims', path: '/claims', icon: <RequestQuoteIcon /> },
        { text: 'Credit Claims', path: '/credit-claims', icon: <CreditCardIcon /> },
      ],
    },
    { text: 'Payment History', icon: <PolicyIcon />, path: '/paymenthistory' },
    { text: 'Provider Statement', icon: <DomainAddIcon />, path: '/providerstatement' },
    { text: 'Total Payable Amount', icon: <DomainAddIcon />, path: '/totalpayableamount' },
  ];

  const handleSubmenuClick = () => {
    setOpenSubmenu(!openSubmenu);
  };

  const handleMenuItemClick = (index) => {
    setClickedMenu(index);
    setClickeSubMenu(null);
  };
  const handleSubMenuItemClick = (index, subIndex) => {
    setClickedMenu(index);
    setClickeSubMenu(subIndex);
  };

  React.useEffect(() => {
    const { pathname } = location;
    const firstPathSegment = pathname.split('/')[1];
    const { activeMenuIndex, activeSubMenuIndex } = findActiveMenuAndSubMenu(menuItems, '/' + firstPathSegment);

    if (activeSubMenuIndex !== null) {
      setOpenSubmenu(true);
    }
    setClickedMenu(activeMenuIndex);
    setClickeSubMenu(activeSubMenuIndex);
  }, [location]);

  const findActiveMenuAndSubMenu = (items, path) => {
    let activeMenuIndex = null;
    let activeSubMenuIndex = null;

    items.forEach((item, index) => {
      if (item.path === path) {
        activeMenuIndex = index;
      } else if (item.submenus) {
        const subMenuIndex = item.submenus.findIndex(submenu => submenu.path === path);
        if (subMenuIndex !== -1) {
          activeMenuIndex = index;
          activeSubMenuIndex = subMenuIndex;
        }
      }
    });

    return { activeMenuIndex, activeSubMenuIndex };
  };

  const drawer = () => {
    return (<List>
      {menuItems.map((item, index) => (
        <React.Fragment key={index}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {item.submenus ? (
              <ListItemButton
                onClick={handleSubmenuClick}
                sx={{
                  justifyContent: 'initial',
                  pl: 1,
                  mx: 2
                }}>
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                  color: clickedMenu === index ? '#ffffff' : '#27aae1',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{
                  opacity: 1,
                  color: clickedMenu === index ? '#ffffff' : '#27aae1'
                }} />
                {openSubmenu ?
                  <ExpandLess sx={{ color: clickedMenu === index ? '#ffffff' : '#27aae1' }} /> :
                  <ExpandMore sx={{ color: clickedMenu === index ? '#ffffff' : '#27aae1' }} />}
              </ListItemButton>
            ) : (
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  justifyContent: 'initial',
                  background: clickedMenu === index ? '#303c95' : '',
                  borderRadius: '16px',
                  mx: 1,
                  ":hover": {
                    background: clickedMenu === index ? '#303c95' : '',
                  }
                }}
                // dense
                onClick={() => handleMenuItemClick(index)}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                  color: clickedMenu === index ? '#ffffff' : '#27aae1',
                }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text}
                  sx={{
                    opacity: 1,
                    color: clickedMenu === index ? '#ffffff' : '#27aae1',
                  }} />
              </ListItemButton>
            )}
          </ListItem>
          {item.submenus && (
            <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.submenus.map((submenu, subIndex) => (
                  <ListItem key={subIndex} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={Link}
                      to={submenu.path}
                      sx={{
                        background: clickeSubdMenu === subIndex ? '#303c95' : '',
                        color: clickeSubdMenu === subIndex ? '#ffffff' : '#27aae1',
                        ":hover": {
                          background: clickeSubdMenu === subIndex ? '#303c95' : '',
                        },
                        borderRadius: '20px',
                        mx: 1,
                        justifyContent: 'initial',
                        pl: 4,
                      }}
                      // dense
                      onClick={() => handleSubMenuItemClick(index, subIndex)}
                    >
                      <ListItemIcon sx={{
                        minWidth: 0,
                        mr: 3,
                        justifyContent: 'center',
                        color: clickeSubdMenu === subIndex ? '#ffffff' : '#27aae1',
                      }}>
                        {submenu.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={submenu.text}
                        sx={{
                          opacity: 1,
                          color: clickeSubdMenu === subIndex ? '#ffffff' : '#27aae1',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      ))}
    </List>)
  }

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="menu list"
    >
      <Drawer
        variant="temporary"
        open={open}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#00539b' },

        }}
      >
        {drawer()}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
        PaperProps={{ sx: { backgroundColor: '#00539b' } }}>
        <DrawerHeader>
          {/* <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <i className="pi pi-angle-double-left" style={{ marginRight: '0.5rem', opacity: open ? 1 : 0, color: 'white' }}></i>}
          </IconButton> */}
        </DrawerHeader>
        <Divider />
        {drawer()}
      </Drawer >
    </Box>
    // <Drawer variant="permanent" open={open} PaperProps={{ sx: { backgroundColor: '#00539b' } }}>
    //   <DrawerHeader>
    //     <IconButton onClick={handleDrawerClose}>
    //       {theme.direction === 'rtl' ? <ChevronRightIcon /> : <i className="pi pi-angle-double-left" style={{ marginRight: '0.5rem', opacity: open ? 1 : 0, color: 'white' }}></i>}
    //     </IconButton>
    //   </DrawerHeader>
    //   <Divider />

    // </Drawer>
  );
};

export default Sidebar;
