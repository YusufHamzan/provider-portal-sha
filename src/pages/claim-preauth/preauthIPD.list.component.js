import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import RoleService from '../../../services/utility/role';
import { PreAuthService } from '../../remote-api/api/claims-services';
import { MemberService } from '../../remote-api/api/member-services';
import { BenefitService, ProvidersService, ServiceTypeService } from '../../remote-api/eo2v2-remote-api';
import { Eo2v2DataGrid } from '../../shared-components';
import PreAuthTimeLineModal from './modals/preauth.timeline.modal.component';
import preAuthReviewModel, { PRE_AUTH_STATUS_MSG_MAP } from './preauth.shared';
import { Box, Divider, Grid, Modal, TextField, Typography, useTheme } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { CloseOutlined } from '@material-ui/icons';
import { Button } from 'primereact/button';

localStorage.removeItem('preauthid');
const roleService = new RoleService();

const PAGE_NAME = 'PRE_AUTH';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  background: '#fff',
  // border: '2px solid #000',
  boxShadow: 24,
  padding: '2% 3%',
};

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 505,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px',
  },
  agentListButton: {
    marginLeft: '5px',
  },
  categoryButton: {
    marginLeft: '5px',
    marginBottom: '5px',
  },
}));

const memberservice = new MemberService();
const preAuthService = new PreAuthService();
const benefitService = new BenefitService();
const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();

// const dataSource$ = (pageRequest = {
//   page: 0,
//   size: 5,
//   summary: true,
//   active: true
// }) => {
//   agentsService.getAgents(pageRequest).
//     map(val => {
//     val.content.forEach(ele => {
//       ele['primaryContact'] = ele.agentBasicDetails.contactNos[0].contactNo
//     })
//     return val
//   })
// };

const getColor = status => {
  switch (status) {
    case 'Pending Evaluation':
      return { background: 'rgba(149,48,55,0.5)', border: 'rgba(149,48,55,1)' };
    case 'Evaluation in progress':
      return { background: 'rgba(255, 252, 127, 0.5)', border: 'rgba(255, 252, 255, 1)' };
    case 'Requested for evaluation':
      return { background: 'rgba(4, 59, 92, 0.5)', border: 'rgba(4, 59, 92, 1)', color:"#f1f1f1" };
    case 'Approved':
      return { background: 'rgba(1, 222, 116, 0.5)', border: 'rgba(1, 222, 116, 1)' };
    case 'Rejected':
      return { background: 'rgba(255,50,67,0.5)', border: 'rgba(255,50,67,1)' };
    case 'Document requested':
      return { background: 'rgba(165, 55, 253, 0.5)', border: 'rgba(165, 55, 253, 1)' };
    case 'Approved failed':
      return { background: 'rgb(139, 0, 0,0.5)', border: 'rgb(139, 0, 0)' };
    case 'Draft':
      return { background: 'rgba(128,128,128,0.5)', border: 'rgba(128,128,128,1)' };
    case 'Waiting for Claim':
      return { background: 'rgba(245, 222, 179, 0.5)', border: 'rgba(245, 222, 179,1)' };
    case 'Cancelled':
      return { background: 'rgba(149,48,55,0.5)', border: 'rgba(149,48,55,1)' };
    case 'Reverted':
      return { background: 'rgba(241, 241, 241, 0.5)', border: 'rgba(241, 241, 241, 1)' };
    default:
      return { background: 'rgba(227, 61, 148, 0.5)', border: 'rgba(227, 61, 148, 1)' };
  }
};

export default function PreAuthIPDListComponent(props) {
  const history = useHistory();
  const [rows, setRows] = React.useState(props.rows);
  const [openReviewModal, setOpenReviewModal] = React.useState(false);
  const [cancelModal, setCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState();
  const [openTimeLineModal, setOpenTimeLineModal] = React.useState(false);
  const [cancelPreAuthId, setCancelPreAuthId] = React.useState();
  const [selectedPreAuthForReview, setSelectedPreAuthForReview] = React.useState(preAuthReviewModel());
  const [selectedPreAuth, setSelectedPreAuth] = React.useState({});
  const [searchType, setSearchType] = React.useState();
  const [searchModal, setSearchModal] = React.useState(false);
  const [fromExpectedDOA, setFromExpectedDOA] = React.useState(new Date());
  const [toExpectedDOA, setToExpectedDOA] = React.useState('');
  const [fromExpectedDOD, setFromExpectedDOD] = React.useState(new Date());
  const [toExpectedDOD, setToExpectedDOD] = React.useState('');
  const [fromDate, setFromDate] = React.useState(new Date());
  const [toDate, setToDate] = React.useState('');
  const [reloadTable, setReloadTable] = React.useState(false);
  const [state, setState] = React.useState();
  const classes = useStyles();
  const theme = useTheme();

  const utclongDate = date => {
    if (!date) return undefined;
    return date.getTime();
  };

  const columnsDefinations = [
    {
      field: 'id',
      headerName: 'Claim No.',
      body: rowData => (
        <span
          style={{ lineBreak: 'anywhere',textDecoration:"underline", cursor:"pointer" }}
          onClick={() => {
            history.push(`/claims/claims-preauth/${rowData?.id}?mode=viewOnly&auth=IPD`);
          }}
          >
          {rowData.id}
        </span>
      ),
    },
    { field: 'memberShipNo', headerName: 'Membership No.' },
    { field: 'memberName', headerName: 'Name' },
    { field: 'policyNumber', headerName: 'Policy No.' },
    { field: 'admissionDate', headerName: 'Admission Date' },
    { field: 'dischargeDate', headerName: 'Discharge Date' },
    {
      field: 'status',
      headerName: 'Status',
      body: rowData => (
        <span
          style={{
            backgroundColor: getColor(rowData.status).background,
            // opacity: '0.9',
            color: getColor(rowData.status).color ? getColor(rowData.status).color : "#3c3c3c",
            border: '1px solid',
            borderColor: getColor(rowData?.status).border,
            borderRadius: '8px',
            padding: '4px',
          }}>
          {rowData.status}
        </span>
      ),
    },
  ];

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      preAuthType: 'IPD',
      // fromExpectedDOA: fromExpectedDOA,
      // toExpectedDOA: fromExpectedDOA,
      // fromExpectedDOD: fromExpectedDOD,
      // toExpectedDOD: toExpectedDOD,
      // fromDate: fromDate,
      // toDate: toDate,
    },
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc'];
    if (pageRequest.searchKey) {
      pageRequest['memberShipNo'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['preAuthStatus'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['policyNumber'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['id'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['name'] = pageRequest.searchKey.toUpperCase().trim();
      delete pageRequest.searchKey;
    }

    const querytype = {
      1: {
        fromExpectedDOA: utclongDate(fromExpectedDOA),
        toExpectedDOA: toExpectedDOA ? utclongDate(toExpectedDOA) : utclongDate(fromExpectedDOA),
      },
      2: {
        fromExpectedDOD: utclongDate(fromExpectedDOD),
        toExpectedDOD: toExpectedDOD ? utclongDate(toExpectedDOD) : utclongDate(fromExpectedDOD),
      },
      3: {
        fromDate: utclongDate(fromDate),
        toDate: toDate ? utclongDate(toDate) : utclongDate(fromDate),
      },
    };

    const pagerequestquery = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: true,
      active: true,
      ...(searchType && querytype[searchType]),
    };

    return preAuthService.getAllPreAuths(searchType ? pagerequestquery : pageRequest).pipe(
      tap(data => {
        // props.setCount(data?.data?.totalElements);
        setState(data?.data);
      }),
      map(data => {
        console.log("dataaa",data)
        let content = data?.data?.content;
        let records = content.map(item => {
          item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString();
          item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString();
          item['status'] = PRE_AUTH_STATUS_MSG_MAP[item.preAuthStatus];
          return item;
        });
        data.content = records;
        return data?.data;
      }),
    );
  };

  const handleOpen = () => {
    history.push('/claims/claims-preauth?mode=create&auth=IPD');
  };

  React.useEffect(() => {
    setRows(props.rows);
  }, [props.rows]);

  const openEditSection = preAuth => {
    history.push(`/claims/claims-preauth/${preAuth.id}?mode=edit&auth=IPD`);
  };

  const openReviewSection = preAuth => {
    history.push(`/claims/claims-preauth/review/${preAuth.id}?auth=IPD`);
  };

  const cancelPreAuth = preAuth => {
    setCancelModal(true);
    setCancelPreAuthId(preAuth.id);
  };

  const onConfirmCancel = () => {
    let payload = {
      reasonForCancellation: cancelReason,
    };
    preAuthService.cancelPreAuth(payload, cancelPreAuthId).subscribe(res => {
      setTimeout(() => {
        window.location.reload();
      }, [300]);
    });
  };

  const openForReview = preAuth => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      key: 'MEMBERSHIP_NO',
      value: preAuth.memberShipNo,
      key1: 'policyNumber',
      value1: preAuth.policyNumber,
    };

    let bts$ = benefitService.getAllBenefit({ page: 0, size: 1000 });
    let ps$ = providerService.getProviders();
    let serviceAll$ = forkJoin(
      serviceDiagnosis.getServicesbyId('867854950947827712', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false,
      }),
      serviceDiagnosis.getServicesbyId('867855014529282048', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false,
      }),
      serviceDiagnosis.getServicesbyId('867855088575524864', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false,
      }),
      serviceDiagnosis.getServicesbyId('867855148155613184', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false,
      }),
    );

    memberservice.getMember(pageRequest).subscribe(res => {
      if (res.content?.length > 0) {
        const member = res.content[0];
        setSelectedPreAuthForReview({ member, preAuth });
        setOpenReviewModal(true);
      }
    });
  };

  const openTimeLine = preAuth => {
    setSelectedPreAuth(preAuth);
    setOpenTimeLineModal(true);
  };

  const openReimbursement = preAuth => {
    history.push(`/claims/claims?mode=create&type=preauth&preId=` + preAuth.id);
  };

  const openDocumentsSection = preAuth => {
    history.push(`/claims/claims-preauth/${preAuth.id}?mode=edit&auth=IPD&addDoc=true`);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
  };

  const handleCloseTimeLineModal = () => {
    setOpenTimeLineModal(false);
  };

  const disableEnhance = item => {
    return (
      item.preAuthStatus != 'DRAFT' &&
      item.preAuthStatus != 'REVERTED' &&
      item.preAuthStatus != 'APPROVED' &&
      item.preAuthStatus != 'REJECTED'
    );
  };

  const disableClaimReimburse = item => {
    return item.preAuthStatus != 'WAITING_FOR_CLAIM';
  };

  const disableAddDocs = item => {
    return item.preAuthStatus != 'ADD_DOC_REQUESTED';
  };

  const disableReviewButton = item => {
    return (
      item.preAuthStatus != 'IN REVIEW' &&
      item.preAuthStatus != 'REQUESTED' &&
      item.preAuthStatus != 'EVALUATION_INPROGRESS' &&
      item.preAuthStatus != 'PENDING_EVALUATION'
    );
  };

  const disableCancelButton = item => {
    return item.preAuthStatus == 'CANCELLED';
  };

  const onSearch = () => {
    setSearchModal(false);
    setReloadTable(true);
    setTimeout(() => {
      setReloadTable(false);
      // setSearchDischargeDate('');
      // setSearchAdmissionDate('');
      setFromExpectedDOA('');
      setToExpectedDOA('');
      setFromExpectedDOD('');
      setToExpectedDOD('');
      setFromDate('');
      setToDate('');
    }, [1000]);
  };

  const preAuthDOASearch = type => {
    setSearchModal(true);
    setSearchType(1);
  };

  const preAuthDODSearch = type => {
    setSearchModal(true);
    setSearchType(2);
  };
  const preAuthCreationSearch = type => {
    setSearchModal(true);
    setSearchType(3);
  };

  const clearAllClick = () => {
    setFromExpectedDOA('');
    setToExpectedDOA('');
    setFromExpectedDOD('');
    setToExpectedDOD('');
    setFromDate('');
    setToDate('');
    setSearchType();
    setReloadTable(true);
  };

  const configuration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    actionButtons: [
      {
        key: 'update_preauth',
        icon: 'pi pi-pencil',
        disabled: disableEnhance,
        className: classes.categoryButton,
        onClick: openEditSection,
        tooltip: 'Enhance',
      },

      {
        key: 'review_preauth',
        icon: 'pi pi-book',
        disabled: disableReviewButton,
        className: classes.categoryButton,
        onClick: openReviewSection,
        tooltip: 'Review',
      },
      {
        key: 'review_cancel',
        icon: 'pi pi-times',
        className: classes.categoryButton,
        disabled: disableCancelButton,
        onClick: cancelPreAuth,
        tooltip: 'Cancel',
      },
      {
        key: 'timeleine_preauth',
        icon: 'pi pi-calendar-times',
        className: classes.categoryButton,
        onClick: openTimeLine,
        tooltip: 'Timeleine',
      },
      {
        key: 'claim_preauth',
        icon: 'pi pi-money-bill',
        className: classes.categoryButton,
        disabled: disableClaimReimburse,
        onClick: openReimbursement,
        tooltip: 'Claim',
      },
      {
        key: 'claim_preauth',
        icon: 'pi pi-paperclip',
        className: classes.categoryButton,
        disabled: disableAddDocs,
        onClick: openDocumentsSection,
        tooltip: 'Add Documents',
      },
    ],

    header: {
      enable: true,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Pre-Auth - IPD',
      enableGlobalSearch: true,
      searchText: 'Search by Claim No, Membership No, Name, Policy id or Status',
      selectionMenus: [
        { icon: '', text: 'Admission Date', onClick: preAuthDOASearch },
        { icon: '', text: 'Discharge Date', onClick: preAuthDODSearch },
        { icon: '', text: 'Creation Date', onClick: preAuthCreationSearch },
        { icon: '', text: 'Clear All', onClick: clearAllClick },
      ],
      selectionMenuButtonText: 'Search',
      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    },
  };

  return (
    <div>
      {/* <DataGrid rows={rows} columns={props.columns} pageSize={10} /> */}
      <Eo2v2DataGrid
        $dataSource={dataSource$}
        config={configuration}
        columnsDefination={columnsDefinations}
        onEdit={openEditSection}
        reloadTable={reloadTable}
      />

      {/* <PreAuthReviewModal preAuthReviewModel={selectedPreAuthForReview} open={openReviewModal} onClose={handleCloseReviewModal} setState={setSelectedPreAuthForReview}></PreAuthReviewModal> */}
      <PreAuthTimeLineModal preAuth={selectedPreAuth} open={openTimeLineModal} onClose={handleCloseTimeLineModal} />

      <Modal
        open={cancelModal}
        onClose={() => {
          setCancelModal(false);
        }}>
        <Box sx={style}>
          <div style={{ padding: '5px' }}>
            <strong>Cancel Reason</strong>
            <Grid container rowSpacing={5} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="filled-multiline-static"
                  label="Add comment"
                  multiline
                  fullWidth
                  minRows={4}
                  variant="filled"
                  onChange={e => {
                    setCancelReason(e.target.value);
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <Box display={'flex'} justifyContent={'end'} marginTop={'15px'}>
            <Button variant="contained" color="primary" onClick={onConfirmCancel}>
              Cancel PreAuth
            </Button>
            <Button variant="text" className="p-button-text">No</Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={searchModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box style={modalStyle}>
          <Box>
            <Box id="alert-dialog-slide-description">
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component="h3" marginBottom={'10px'}>
                      Search By Date of Admission
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOA}
                            onChange={date => setFromExpectedDOA(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOA}
                            onChange={date => setToExpectedDOA(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 2 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component="h3" marginBottom={'10px'}>
                      Seach by Date of Discharge
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOD}
                            onChange={date => setFromExpectedDOD(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOD}
                            onChange={date => setToExpectedDOD(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 3 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component="h3" marginBottom={'10px'}>
                      Search By Creation Date
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromDate}
                            onChange={date => setFromDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toDate}
                            onChange={date => setToDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <Box marginTop={'10%'}>
            <Button
              variant="contained"
              style={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
              onClick={onSearch}>
              Search
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
