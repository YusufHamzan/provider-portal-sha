import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
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
import Collapse from '@mui/material/Collapse';
import { Link } from 'react-router-dom';
import { drawerWidth } from '.';

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Sidebar = ({ open, handleDrawerClose }) => {
  const theme = useTheme();
  const [openSubmenu, setOpenSubmenu] = React.useState(false);

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    backgroundColor: '#303c95',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));

  const menuItems = [
    // { item: "Dashboard", img: DashboardIcon },
    //         { item: "Member Eligibility", img: SupervisedUserCircleIcon },
    //         { item: "Preauth", img: ReceiptIcon },
    //         { item: "Claim", img: PriceChangeIcon },
    //         { item: "Payment History", img: HistoryIcon },
    //         { item: "Provider Statement", img: ContentPasteIcon },
    //         { item: "Total Payable Amount", img: PaidIcon },


    { text: 'Dashboard', icon: <SpaceDashboardIcon />, path: '/' },
    { text: 'Member Eligibility', icon: <PeopleIcon />, path: '/membereligibility' },
    {
      text: 'Claims',
      icon: <CategoryIcon />,
      submenus: [
        { text: 'Preauths', path: '/preauths' },
        { text: 'Claims', path: '/claims' },
      ],
    },
    { text: 'Payment History', icon: <PolicyIcon />, path: '/paymenthistory' },
    { text: 'Provider Statement', icon: <DomainAddIcon />, path: '/providerstatement' },
    { text: 'Total Payable Amount', icon: <DomainAddIcon />, path: '/totalpayableamount' },
    // { text: 'Submit Claim', icon: <AssistantIcon />, path: '/submit-claim' },
    // { text: 'Submit Preauth', icon: <RequestQuoteIcon />, path: '/submit-preauth' },
  ];

  const handleSubmenuClick = () => {
    setOpenSubmenu(!openSubmenu);
  };

  return (
    <Drawer variant="permanent" open={open} PaperProps={{ sx: { backgroundColor: '#303c95' } }}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <i className="pi pi-angle-double-left" style={{ marginRight: '0.5rem', opacity: open ? 1 : 0, color: 'white' }}></i>}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              {item.submenus ? (
                <ListItemButton onClick={handleSubmenuClick}>
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#9DA0CD'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, color: '#9da0cd' }} />
                  {openSubmenu ? <ExpandLess sx={{ color: '#9DA0CD' }} /> : <ExpandMore sx={{ color: '#9DA0CD' }} />}
                </ListItemButton>
              ) : (
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#9DA0CD'
                  }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, color: '#9da0cd' }} />
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
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          pl: open ? 4 : 3,
                        }}
                      >
                        <ListItemIcon sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                          color: '#9DA0CD'
                        }}>
                          {/* submenu icons */}
                        </ListItemIcon>
                        <ListItemText primary={submenu.text} sx={{ opacity: open ? 1 : 0, color: '#9da0cd' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
