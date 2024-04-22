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
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  background: '#fff',
  // border: '2px solid #000',
  boxShadow: 24,
  padding: "2% 3%",
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
    marginBottom: '5px'
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

export default function PreAuthOPDListComponent(props) {
  const history = useHistory();
  const [rows, setRows] = React.useState(props.rows);
  const [openReviewModal, setOpenReviewModal] = React.useState(false);
  const [cancelModal, setCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState();
  const [openTimeLineModal, setOpenTimeLineModal] = React.useState(false);
  const [cancelPreAuthId, setCancelPreAuthId] = React.useState();
  const [selectedPreAuthForReview, setSelectedPreAuthForReview] = React.useState(preAuthReviewModel());
  const [selectedPreAuth, setSelectedPreAuth] = React.useState({});
  const [searchType, setSearchType] = React.useState()
  const [searchModal, setSearchModal] = React.useState(false)
  const [searchAdmissionDate, setSearchAdmissionDate] = React.useState("");
  const [searchDischargeDate, setSearchDischargeDate] = React.useState("");
  const [reloadTable, setReloadTable] = React.useState(false);
  const classes = useStyles();
  const theme = useTheme();

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      preAuthType:"OPD"
    },
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc'];
    if (pageRequest.searchKey) {
      pageRequest['memberShipNo'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['preAuthStatus'] = pageRequest.searchKey.toUpperCase().trim();
      pageRequest['policyNumber'] = pageRequest.searchKey.toUpperCase().trim();
      delete pageRequest.searchKey
    }
    return preAuthService.getAllPreAuths(pageRequest).pipe(
      tap(data => {
        // props.setCount(data?.data?.totalElements);
        }),
      map(data => {
        let content = data?.data?.content;
        let records = content.map(item => {
          item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString();
          item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString();
          item['status'] = PRE_AUTH_STATUS_MSG_MAP[item.preAuthStatus];
          return item;
        });
        data.content = records;
        return data;
      }),
    );
  };

  const handleOpen = () => {
    history.push('/claims/claims-preauth?mode=create&auth=OPD');
  };

  const columnsDefinations = [
    {
      field: 'id', headerName: 'Claim No.', body: (rowData) => (
        <span style={{ lineBreak: "anywhere", textDecoration: "underline" }} onClick={() => { history.push(`/claims/claims-preauth/review/${rowData.id}?auth=OPD`); }}>
          {rowData.id}
        </span>
      )
    },
    { field: 'memberShipNo', headerName: 'Membership No.' },
    { field: 'name', headerName: 'Name' },
    { field: 'policyNumber', headerName: 'Policy No.' },
    { field: 'admissionDate', headerName: 'Admission Date' },
    { field: 'dischargeDate', headerName: 'Discharge Date' },
    { field: 'status', headerName: 'Status' }

  ];


  React.useEffect(() => {
    setRows(props.rows);
  }, [props.rows]);

  const openEditSection = preAuth => {
    history.push(`/claims/claims-preauth/${preAuth.id}?mode=edit&auth=OPD`);
  };


  const openReviewSection = preAuth => {
    history.push(`/claims/claims-preauth/review/${preAuth.id}`);
  };

  const cancelPreAuth = preAuth => {
    setCancelModal(true)
    setCancelPreAuthId(preAuth.id)
  };

  const onConfirmCancel = () => {
    let payload = {
      "reasonForCancellation": cancelReason
    }
    preAuthService.cancelPreAuth(payload, cancelPreAuthId).subscribe(res => {
      setTimeout(() => {
        window.location.reload();
      }, [300])
    })
  }


  const openForReview = preAuth => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      key: 'MEMBERSHIP_NO',
      value: preAuth.memberShipNo,
      key1: 'policyNumber',
      value1: preAuth.policyNumber
    }

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
  }

  const openTimeLine = preAuth => {
    setSelectedPreAuth(preAuth);
    setOpenTimeLineModal(true);
  }

  const openReimbursement = preAuth => {
    history.push(`/claims/claims-reimbursement?mode=create&type=preauth&preId=` + preAuth.id);
  }

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
  }

  const handleCloseTimeLineModal = () => {
    setOpenTimeLineModal(false);
  }


  const disableEnhance = (item) => {
    return item.preAuthStatus != 'DRAFT' && item.preAuthStatus != 'REVERTED' && item.preAuthStatus != 'APPROVED'
  }

  const disableClaimReimburse = (item) => {
    return item.preAuthStatus != 'WAITING_FOR_CLAIM'
  }


  const disableReviewButton = (item) => {
    return item.preAuthStatus != 'IN REVIEW' && item.preAuthStatus != 'REQUESTED' && item.preAuthStatus != 'EVALUATION_INPROGRESS';
  }

  const disableCancelButton = (item) => {
    return item.preAuthStatus == 'CANCELLED';
  }

  const onSearch = () => {
    setSearchModal(false);
    setReloadTable(true);
    setTimeout(() => {
      setReloadTable(false)
      setSearchDischargeDate("");
      setSearchAdmissionDate("");
    }, [5000]);
  }

  const QuotationDateClick = (type) => {
    setSearchModal(true);
    setSearchType(1)
  }

  const QuotationNumberClick = (type) => {
    setSearchModal(true);
    setSearchType(2)
  }

  const clearAllClick = () => {
    setSearchDischargeDate("");
    setSearchAdmissionDate("");
    onSearch();
  }

  const configuration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', actionBtnList),
    actionButtons: [
      {
        key: 'update_preauth',
        icon: 'pi pi-pencil',
        // disabled: disableEnhance,
        className: classes.categoryButton,
        onClick: openEditSection,
        tooltip: "Enhance"
      },
      {
        key: 'review_cancel',
        icon: 'pi pi-times',
        className: classes.categoryButton,
        disabled: disableCancelButton,
        onClick: cancelPreAuth,
        tooltip: "Cancel"

      },
      {
        key: 'timeleine_preauth',
        icon: 'pi pi-calendar-times',
        className: classes.categoryButton,
        onClick: openTimeLine,
        tooltip: "Timeleine"

      },
      {
        key: 'claim_preauth',
        icon: 'pi pi-book',
        className: classes.categoryButton,
        disabled: disableClaimReimburse,
        onClick: openReimbursement,
        tooltip: "Claim Reimburse"

      },


    ],

    header: {
      enable: true,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Pre-Auth - OPD',
      enableGlobalSearch: true,
      searchText: 'Search by Policy id, Status',
      selectionMenus: [
        { icon: "", text: "Admission Date", onClick: QuotationDateClick },
        { icon: "", text: "Discharge Date", onClick: QuotationNumberClick },
        { icon: "", text: "Clear All", onClick: clearAllClick }
      ],
      selectionMenuButtonText: "Search"
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
        onClose={() => { setCancelModal(false) }}
      >
        <Box sx={style}>
          <div style={{ padding: '5px' }}>
            <strong>Cancel Reason</strong>
            <Grid container rowSpacing={5} style={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="filled-multiline-static"
                  label="Add comment"
                  multiline
                  fullWidth
                  minRows={4}
                  variant="filled"
                  onChange={(e) => { setCancelReason(e.target.value) }}
                />
              </Grid>
            </Grid>
          </div>
          <Box display={"flex"} justifyContent={"end"} marginTop={"15px"}>
            <Button variant='contained' color='primary' onClick={onConfirmCancel}>Cancel PreAuth</Button>
            <Button variant='text' className="search">No</Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={searchModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        onClose={() => setSearchModal(false)}
      >
        <Box style={modalStyle}>
          <Box>
            <Box id="alert-dialog-slide-description">
              {searchType == 1 &&
                <>
                  <Box display={"flex"} justifyContent={"space-between"}>
                    <Box component="h3" marginBottom={"10px"}>Admission Date</Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: "pointer" }} />
                  </Box>
                  <Box display={"flex"} marginBottom={"10px"}>
                    <Box style={{ marginBottom: "10px" }}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils} >
                        <KeyboardDatePicker
                          views={["year", "month", "date"]}
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="normal"
                          autoOk={true}
                          id="date-picker-inline"
                          value={searchAdmissionDate || new Date}
                          onChange={(e) => setSearchAdmissionDate(e)}
                          KeyboardButtonProps={{
                            'aria-label': 'change ing date',
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Box>
                  </Box>
                </>
              }
              {searchType == 2 &&
                <>
                  <Box display={"flex"} justifyContent={"space-between"}>
                    <Box component="h3" marginBottom={"10px"}>Discharge Date</Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: "pointer" }} />
                  </Box>
                  <Box display={"flex"} marginBottom={"10px"}>
                    <Box style={{ marginBottom: "10px" }}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils} >
                        <KeyboardDatePicker
                          views={["year", "month", "date"]}
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="normal"
                          autoOk={true}
                          id="date-picker-inline"
                          value={searchDischargeDate || new Date}
                          onChange={(e) => setSearchDischargeDate(e)}
                          KeyboardButtonProps={{
                            'aria-label': 'change ing date',
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Box>
                  </Box>
                </>
              }
            </Box>
          </Box>
          <Box marginTop={"10%"}>
            <Button variant='contained' style={{ backgroundColor: theme.palette.primary.main, color: "#fff" }} onClick={onSearch}>Search</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
