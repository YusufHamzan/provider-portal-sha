import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { ClaimService } from "../remote-api/api/claim-services";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP, REIM_STATUS_MSG_MAP } from "../utils/helper";
import { useNavigate } from "react-router-dom";

const utclongDate = (date) => {
  if (!date) return undefined;
  return date.getTime();
};
const claimservice = new ClaimService();

const Claims = () => {
  let providerId = localStorage.getItem("providerId");
  const navigate = useNavigate();
  const columnsDefinations = [
    {
      field: "memberShipNo",
      headerName: "Membership No.",
      body: (rowData) => (
        <span
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => handleMembershipClick(rowData, "membershipNo")}
        >
          {rowData.memberShipNo}
        </span>
      ),
    },
    { field: "memberName", headerName: "Name" },
    { field: "policyNumber", headerName: "Policy" },
    { field: "admissionDate", headerName: "Admission Date" },
    { field: "dischargeDate", headerName: "Discharge Date" },
    {
      field: 'vip',
      headerName: 'Is Vip ?',
      body: rowData => <span>{rowData.vip ? 'Yes' : 'No'}</span>,
    },
    {
      field: 'political',
      headerName: 'Is Political ?',
      body: rowData => <span>{rowData.political ? 'Yes' : 'No'}</span>,
    },
    { field: "reimbursementStatus", headerName: "Status" },
  ];

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      claimCategory: "CLAIM",
      claimSource: "PRE_AUTH",
    }
  ) => {
    pageRequest.sort = ["rowCreatedDate dsc"];
    // pageRequest.claimType = ['REIMBURSEMENT_CLAIM'];
    return claimservice.getClaimReim(pageRequest, providerId).pipe(
      map((data) => {
        let content = data?.data?.content;
        let records = content.map((item) => {
          item["admissionDate"] = new Date(
            item.expectedDOA
          ).toLocaleDateString();
          item["dischargeDate"] = new Date(
            item.expectedDOD
          ).toLocaleDateString();
          item["stat"] = item.reimbursementStatus
            ? REIM_STATUS_MSG_MAP[item.reimbursementStatus]
            : null;

          return item;
        });
        data.content = records;
        return data;
      })
    );
  };

  const handleOpen = () => {
    navigate("/submit-claim");
  };

  const configuration = {
    enableSelection: false,
    scrollHeight: "300px",
    pageSize: 10,
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', actionBtnList),
    actionButtons: [
      {
        key: "update_preauth",
        icon: "pi pi-pencil",
        // disabled: disableEnhance,
        // className: classes.categoryButton,
        // onClick: openEditSection,
        tooltip: "Enhance",
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
      text: "Claims",
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
  );
};

export default Claims;
