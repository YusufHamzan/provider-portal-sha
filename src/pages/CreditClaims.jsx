import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP, REIM_STATUS_MSG_MAP } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import React from "react";
import { CreditClaimService } from "../remote-api/api/claim-services/credit-claim-services";

const utclongDate = (date) => {
  if (!date) return undefined;
  return date.getTime();
};
const claimservice = new CreditClaimService();

const CreditClaims = () => {
  let providerId = localStorage.getItem("providerId");
  const navigate = useNavigate();
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });
  const columnsDefinations = [
    {
      field: "memberShipNo",
      headerName: "Membership No.",
      body: (rowData) => (
        <span
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => {
            navigate(`/view/${rowData?.id}?mode=viewOnly&type=creditClaim`);
          }}
          // onClick={() => handleMembershipClick(rowData, "membershipNo")}
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
      field: "vip",
      headerName: "Is Vip ?",
      body: (rowData) => <span>{rowData.vip ? "Yes" : "No"}</span>,
    },
    {
      field: "political",
      headerName: "Is Political ?",
      body: (rowData) => <span>{rowData.political ? "Yes" : "No"}</span>,
    },
    { field: "reimbursementStatus", headerName: "Status" },
  ];

  let pas$ = claimservice.getDashboardCountCreditClaims(providerId);
  React.useEffect(() => {
    pas$.subscribe((result) => {
      setCount(result?.data);
    });
  }, []);

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      // claimCategory: "CLAIM",
      // claimSource: "PRE_AUTH",
    }
  ) => {
    let isSearched = false;
    let providerId = localStorage.getItem("providerId");
    // pageRequest.sort = ["rowCreatedDate dsc"];
    // pageRequest.claimType = ['REIMBURSEMENT_CLAIM'];
    if (pageRequest.searchKey) {
      isSearched = true;
      pageRequest["memberShipNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["claimStatus"] = pageRequest.searchKey.toUpperCase();
      pageRequest["policyNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["id"] = pageRequest.searchKey.toUpperCase();
      pageRequest["memberName"] = pageRequest.searchKey.toUpperCase();
      (pageRequest["providerId"] = providerId), delete pageRequest.searchKey;
    }

    return isSearched
      ? claimservice.getFilteredClaimReim(pageRequest, providerId).pipe(
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
            return data?.data;
          })
        )
      : claimservice.getClaimReim(pageRequest, providerId).pipe(
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
            return data?.data;
          })
        );
  };

  const handleOpen = () => {
    navigate("/submit-claim?type=credit&mode=create");
  };

  const openEditSection = (reim) => {
    navigate(`/submit-claim/${reim.id}?type=credit&mode=edit`);
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
        onClick: openEditSection,
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
      createBtnText: "Credit Claim",
      onCreateButtonClick: handleOpen,
      text: "Credit Claims",
      enableGlobalSearch: true,
      searchText: "Search by Membership Number, Name, Policy Number and Status",
      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    },
  };

  return (
    <>
      <Box display={"flex"} flexWrap={"wrap"} marginBottom={"10px"}>
        {/* <Grid container spacing={2}> */}
        {/* <Grid item xs={6} sm={4} md={2}> */}
        <Box
          sx={{
            paddingRight: "1%",
            marginBottom: { xs: "5px", md: 0 },
            height: {
              xs: "50px",
              sm: "75px",
              md: "100px",
            },
            width: { xs: "50%", sm: "33%", md: "20%" },
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, rgba(49, 60, 150, 0.9) 0%, rgba(49, 60, 150, 0.8) 100%)",
              boxShadow: "0px 1px 1px 2px rgba(128,128,128,0.15)",
              width: "100%",
              height: "100%",
              color: "#ffffff",
              fontSize: { xs: "14px", sm: "16px" },
              display: "flex",
              alignItems: "center",
            }}
          >
            <AccountBalanceWalletOutlinedIcon
              style={{
                fill: "#fff",
                width: "32px",
                display: "flex",
                fontSize: "30px",
                padding: "0px",
                marginInline: "13px",
              }}
            />
            {`Total (${count.total})`}
          </Box>
        </Box>
        {/* </Grid> */}
        {/* <Grid item xs={6} sm={4} md={2}> */}
        <Box
          sx={{
            paddingRight: "1%",
            marginBottom: { xs: "5px", md: 0 },
            height: {
              xs: "50px",
              sm: "75px",
              md: "100px",
            },
            width: { xs: "50%", sm: "33%", md: "20%" },
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, rgba(1, 222, 116, 0.9) 0%, rgba(1, 222, 116,0.8) 100%)",
              boxShadow: "0px 1px 1px 2px rgba(128,128,128,0.15)",
              width: "100%",
              height: "100%",
              color: "#ffffff",
              fontSize: { xs: "14px", sm: "16px" },
              display: "flex",
              alignItems: "center",
            }}
          >
            <ThumbUpAltOutlinedIcon
              style={{
                fill: "#fff",
                width: "32px",
                display: "flex",
                fontSize: "30px",
                marginInline: "13px",
              }}
            />
            {`Approved (${count.approved})`}
          </Box>
        </Box>
        {/* </Grid> */}
        {/* <Grid item xs={6} sm={4} md={2}> */}
        <Box
          sx={{
            paddingRight: "1%",
            marginBottom: { xs: "5px", md: 0 },
            height: {
              xs: "50px",
              sm: "75px",
              md: "100px",
            },
            width: { xs: "50%", sm: "33%", md: "20%" },
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, rgba(255,50,67,0.9) 0%, rgba(255,50,67,0.8) 100%)",
              boxShadow: "0px 1px 1px 2px rgba(128,128,128,0.15)",
              color: "#ffffff",
              display: "flex",
              fontSize: { xs: "14px", sm: "16px" },
              width: "100%",
              height: "100%",
              alignItems: "center",
            }}
          >
            <ThumbDownAltOutlinedIcon
              style={{
                fill: "#fff",
                width: "32px",
                display: "flex",
                fontSize: "30px",
                marginInline: "13px",
              }}
            />
            {`Rejected (${count.rejected})`}
          </Box>
        </Box>
        {/* </Grid> */}
        {/* <Grid item xs={6} sm={4} md={2}> */}
        <Box
          sx={{
            paddingRight: "1%",
            marginBottom: { xs: "5px", md: 0 },
            height: {
              xs: "50px",
              sm: "75px",
              md: "100px",
            },
            width: { xs: "50%", sm: "33%", md: "20%" },
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, rgba(4, 59, 92, 0.9) 0%, rgba(4, 59, 92, 0.8) 100%)",
              boxShadow: "0px 1px 1px 2px rgba(128,128,128,0.15)",
              color: "#ffffff",
              display: "flex",
              fontSize: { xs: "14px", sm: "16px" },
              width: "100%",
              height: "100%",
              alignItems: "center",
            }}
          >
            <RateReviewIcon
              style={{
                fill: "#fff",
                width: "32px",
                display: "flex",
                fontSize: "30px",
                marginInline: "13px",
              }}
            />
            {`Requested (${count.requested})`}
          </Box>
        </Box>
        <Box
          sx={{
            marginBottom: { xs: "5px", md: 0 },
            paddingRight: { xs: "1%", md: "0%" },
            height: {
              xs: "50px",
              sm: "75px",
              md: "100px",
            },
            width: { xs: "50%", sm: "33%", md: "20%" },
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, rgba(149,48,55,0.9) 0%, rgba(149,48,55, 0.8) 100%)",
              boxShadow: "0px 1px 1px 2px rgba(128,128,128,0.15)",
              color: "#ffffff",
              display: "flex",
              width: "100%",
              height: "100%",
              fontSize: { xs: "14px", sm: "16px" },
              alignItems: "center",
            }}
          >
            <CancelOutlinedIcon
              style={{
                fill: "#fff",
                width: "32px",
                display: "flex",
                fontSize: "30px",
                marginInline: "13px",
              }}
            />
            {`Cancelled (${count.cancelled})`}
          </Box>
        </Box>
        {/* </Grid> */}
        {/* </Grid> */}
      </Box>
      <Eo2v2DataGrid
        $dataSource={dataSource$}
        config={configuration}
        columnsDefination={columnsDefinations}
        // onEdit={openEditSection}
        // reloadTable={reloadTable}
      />
    </>
  );
};

export default CreditClaims;
