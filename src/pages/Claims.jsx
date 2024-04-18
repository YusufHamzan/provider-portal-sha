import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { ClaimService } from "../remote-api/api/claim-services";
import { map } from 'rxjs/operators';
import { PRE_AUTH_STATUS_MSG_MAP, REIM_STATUS_MSG_MAP } from "../utils/helper";

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

const utclongDate = date => {
  if (!date) return undefined;
  return date.getTime();
};
const claimservice = new ClaimService()
const Claims = () => {

  const columnsDefinations = [
    {
      field: 'memberShipNo',
      headerName: 'Membership No.',
      body: rowData => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => handleMembershipClick(rowData, 'membershipNo')}>
          {rowData.memberShipNo}
        </span>
      ),
    },
    { field: 'memberName', headerName: 'Name' },
    { field: 'policyNumber', headerName: 'Policy' },
    { field: 'admissionDate', headerName: 'Admission Date' },
    { field: 'dischargeDate', headerName: 'Discharge Date' },
    { field: 'reimbursementStatus', headerName: 'Status' },
  ];

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    },
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc'];
    pageRequest.claimType = ['REIMBURSEMENT_CLAIM'];
    return claimservice.getClaimReim(pageRequest).pipe(map(data => {
      let content = data?.data?.content;
      console.log("dataaa", data, content)
      let records = content.map(item => {
        item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString();
        item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString();
        item['stat'] = item.reimbursementStatus ? REIM_STATUS_MSG_MAP[item.reimbursementStatus] : null;

        return item;
      });
      data.content = records;
      return data;
    }))
  };

  const handleOpen = () => {
    history.push('/claims/claims-preauth?mode=create&auth=IPD');
  };
  
  const configuration = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', actionBtnList),
    actionButtons: [
      {
        key: 'update_preauth',
        icon: 'pi pi-pencil',
        // disabled: disableEnhance,
        // className: classes.categoryButton,
        // onClick: openEditSection,
        tooltip: 'Enhance',
      },

      // {
      //   key: 'review_preauth',
      //   icon: 'pi pi-book',
      //   disabled: disableReviewButton,
      //   className: classes.categoryButton,
      //   onClick: openReviewSection,
      //   tooltip: 'Review',
      // },
      // {
      //   key: 'request_evaluate',
      //   icon: 'pi pi-check-square',
      //   disabled: disableRequestButton,
      //   className: classes.categoryButton,
      //   onClick: onRequestForReview,
      //   tooltip: 'Request',
      // },
    ],

    header: {
      enable: true,
      // addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      addCreateButton: true,
      onCreateButtonClick: handleOpen,
      text: 'Claim Reimbursement',
      enableGlobalSearch: false,
      // searchText: 'Search by code,name,type,contact',
      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    },
  };



  return (
    <Eo2v2DataGrid
      $dataSource={dataSource$}
      config={configuration}
      columnsDefination={columnsDefinations}
    // onEdit={openEditSection}
    // reloadTable={reloadTable}
    />
  )
}

export default Claims;