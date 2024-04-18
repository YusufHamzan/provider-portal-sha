// https://github.com/YusufHamzan/provider-portal.git

import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { ClaimService } from "../remote-api/api/claim-services";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP } from "../utils/helper";
import { Box } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import RateReviewIcon from '@mui/icons-material/RateReview';

import React from "react";

const getColor = (status) => {
  switch (status) {
    case "Pending Evaluation":
      return { background: "rgba(149,48,55,0.5)", border: "rgba(149,48,55,1)" };
    case "Evaluation in progress":
      return {
        background: "rgba(255, 252, 127, 0.5)",
        border: "rgba(255, 252, 255, 1)",
      };
    case "Requested for evaluation":
      return {
        background: "rgba(4, 59, 92, 0.5)",
        border: "rgba(4, 59, 92, 1)",
        color: "#f1f1f1",
      };
    case "Approved":
      return {
        background: "rgba(1, 222, 116, 0.5)",
        border: "rgba(1, 222, 116, 1)",
      };
    case "Rejected":
      return { background: "rgba(255,50,67,0.5)", border: "rgba(255,50,67,1)" };
    case "Document requested":
      return {
        background: "rgba(165, 55, 253, 0.5)",
        border: "rgba(165, 55, 253, 1)",
      };
    case "Approved failed":
      return { background: "rgb(139, 0, 0,0.5)", border: "rgb(139, 0, 0)" };
    case "Draft":
      return {
        background: "rgba(128,128,128,0.5)",
        border: "rgba(128,128,128,1)",
      };
    case "Waiting for Claim":
      return {
        background: "rgba(245, 222, 179, 0.5)",
        border: "rgba(245, 222, 179,1)",
      };
    case "Cancelled":
      return { background: "rgba(149,48,55,0.5)", border: "rgba(149,48,55,1)" };
    case "Reverted":
      return {
        background: "rgba(241, 241, 241, 0.5)",
        border: "rgba(241, 241, 241, 1)",
      };
    default:
      return {
        background: "rgba(227, 61, 148, 0.5)",
        border: "rgba(227, 61, 148, 1)",
      };
  }
};

const utclongDate = (date) => {
  if (!date) return undefined;
  return date.getTime();
};
const claimservice = new ClaimService();
const PreAuthIPDListComponent = () => {
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });

  let pas$ = claimservice.getDashboardCount();
  React.useEffect(() => {
    pas$.subscribe(result => {
      console.log('result', result)
      setCount(result?.data);
    });
  }, []);


  const columnsDefinations = [
    {
      field: "id",
      headerName: "Claim No.",
      body: (rowData) => (
        <span
          style={{
            lineBreak: "anywhere",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => {
            history.push(
              `/claims/claims-preauth/${rowData?.id}?mode=viewOnly&auth=IPD`
            );
          }}
        >
          {rowData.id}
        </span>
      ),
    },
    { field: "memberShipNo", headerName: "Membership No." },
    { field: "memberName", headerName: "Name" },
    { field: "policyNumber", headerName: "Policy No." },
    { field: "admissionDate", headerName: "Admission Date" },
    { field: "dischargeDate", headerName: "Discharge Date" },
    {
      field: "status",
      headerName: "Status",
      body: (rowData) => (
        <span
          style={{
            backgroundColor: getColor(rowData.status).background,
            // opacity: '0.9',
            color: getColor(rowData.status).color
              ? getColor(rowData.status).color
              : "#3c3c3c",
            border: "1px solid",
            borderColor: getColor(rowData?.status).border,
            borderRadius: "8px",
            padding: "4px",
          }}
        >
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
      preAuthType: "IPD",
      // fromExpectedDOA: fromExpectedDOA,
      // toExpectedDOA: fromExpectedDOA,
      // fromExpectedDOD: fromExpectedDOD,
      // toExpectedDOD: toExpectedDOD,
      // fromDate: fromDate,
      // toDate: toDate,
    }
  ) => {
    pageRequest.sort = ["rowCreatedDate dsc"];
    if (pageRequest.searchKey) {
      pageRequest["memberShipNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["preAuthStatus"] = pageRequest.searchKey.toUpperCase();
      pageRequest["policyNumber"] = pageRequest.searchKey.toUpperCase();
      pageRequest["id"] = pageRequest.searchKey.toUpperCase();
      pageRequest["name"] = pageRequest.searchKey.toUpperCase();
      delete pageRequest.searchKey;
    }

    const querytype = {
      // 1: {
      //   fromExpectedDOA: utclongDate(fromExpectedDOA),
      //   toExpectedDOA: toExpectedDOA ? utclongDate(toExpectedDOA) : utclongDate(fromExpectedDOA),
      // },
      // 2: {
      //   fromExpectedDOD: utclongDate(fromExpectedDOD),
      //   toExpectedDOD: toExpectedDOD ? utclongDate(toExpectedDOD) : utclongDate(fromExpectedDOD),
      // },
      // 3: {
      //   fromDate: utclongDate(fromDate),
      //   toDate: toDate ? utclongDate(toDate) : utclongDate(fromDate),
      // },
    };

    const pagerequestquery = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: true,
      active: true,
      // ...(searchType && querytype[searchType]),
    };
    return claimservice.getAllPreauth(pageRequest).pipe(
      map((data) => {
        // return data.content = data;
        let content = data?.data?.content;
        console.log("dataaaa", data, content);
        let records = content.map((item) => {
          item["admissionDate"] = new Date(
            item.expectedDOA
          ).toLocaleDateString();
          item["dischargeDate"] = new Date(
            item.expectedDOD
          ).toLocaleDateString();
          item["status"] = PRE_AUTH_STATUS_MSG_MAP[item.preAuthStatus];
          return item;
        });
        data.content = records;
        return data?.data;
      })
    );
    // return preAuthService.getAllPreAuths(searchType ? pagerequestquery : pageRequest).pipe(
    //   tap(data => {
    //     // props.setCount(data?.data?.totalElements);
    //     setState(data?.data);
    //   }),
    //   map(data => {
    //     let content = data?.data?.content;
    //     let records = content.map(item => {
    //       item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString();
    //       item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString();
    //       item['status'] = PRE_AUTH_STATUS_MSG_MAP[item.preAuthStatus];
    //       return item;
    //     });
    //     data.content = records;
    //     return data?.data;
    //   }),
    // );
  };
  const handleOpen = () => {
    history.push("/claims/claims-preauth?mode=create&auth=IPD");
  };
  const configuration = {
    enableSelection: false,
    scrollHeight: "285px",
    pageSize: 10,
    actionButtons: [
      {
        key: "update_preauth",
        icon: "pi pi-pencil",
        // disabled: disableEnhance,
        // className: classes.categoryButton,
        // onClick: openEditSection,
        tooltip: "Enhance",
      },
      {
        key: "timeleine_preauth",
        icon: "pi pi-calendar-times",
        // className: classes.categoryButton,
        // onClick: openTimeLine,
        tooltip: "Timeleine",
      },
      {
        key: "claim_preauth",
        icon: "pi pi-money-bill",
        // className: classes.categoryButton,
        // disabled: disableClaimReimburse,
        // onClick: openReimbursement,
        tooltip: "Claim",
      },
      {
        key: "claim_preauth",
        icon: "pi pi-paperclip",
        // className: classes.categoryButton,
        // disabled: disableAddDocs,
        // onClick: openDocumentsSection,
        tooltip: "Add Documents",
      },
    ],

    header: {
      enable: true,
      // addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      addCreateButton: true,
      onCreateButtonClick: handleOpen,
      text: "Pre-Auth - IPD",
      enableGlobalSearch: true,
      searchText:
        "Search by Claim No, Membership No, Name, Policy id or Status",
      // selectionMenus: [
      //   { icon: '', text: 'Admission Date', onClick: preAuthDOASearch },
      //   { icon: '', text: 'Discharge Date', onClick: preAuthDODSearch },
      //   { icon: '', text: 'Creation Date', onClick: preAuthCreationSearch },
      //   { icon: '', text: 'Clear All', onClick: clearAllClick },
      // ],
      selectionMenus: [
        { icon: "", text: "Admission Date" },
        { icon: "", text: "Discharge Date" },
        { icon: "", text: "Creation Date" },
        { icon: "", text: "Clear All" },
      ],
      selectionMenuButtonText: "Search",
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
        {/* </Grid> */}
        {/* <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(128,128,128,0.9) 0%, rgba(128,128,128, 0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  fontSize: { xs: '14px', sm: '16px' },
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                }}>
                <DraftsOutlinedIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Draft (${count.draft})`}
              </Box>
            </Box>
          </Grid> */}
        {/* <Grid item xs={6} sm={4} md={2}> */}
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

export default PreAuthIPDListComponent;
