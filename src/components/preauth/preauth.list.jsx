// https://github.com/YusufHamzan/provider-portal.git

import { Eo2v2DataGrid } from "../eo2v2.data.grid";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP } from "../../utils/helper";
import { Box, Button, Tooltip, styled } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { PreAuthService } from "../../remote-api/api/claim-services/preauth-services";
import { BenefitService } from "../../remote-api/api/master-services/benefit-service";
import { PoliticalDot, VIPDot } from "../vip.dot";

const getColor = (status) => {
  switch (status) {
    case "Pending Evaluation":
      return { background: "rgba(149,48,55,0.5)", border: "rgba(149,48,55,1)" };
    case "Evaluation in progress":
      return {
        background: "rgba(255, 252, 127, 0.5)",
      };
    case "Requested for evaluation":
      return {
        background: "#002776",
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
    case "Document Requested":
      return {
        background: "#ffc107",
        color: "#212529",
      };
    case "Approved failed":
      return { background: "rgb(139, 0, 0,0.5)", border: "rgb(139, 0, 0)" };
    case "Draft":
      return {
        background: "#17a2b8",
        color: "#f1f1f1",
      };
    case "Waiting for Claim":
      return {
        background: "#ffc107",
        color: "#212529",
      };
    case "Cancelled":
      return { background: "#c70000", color: "#f1f1f1" };
    case "Reverted":
      return {
        background: "#808000",
        color: "#f1f1f1",
      };
    case "Claim Initiated":
      return {
        background: "rgba(38,194, 129, 0.5)",
        border: "rgba(38, 194, 129, 1)",
      };
    case "Document Submited":
      return {
        background: "#313c96",
        color: "#f1f1f1",
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
const claimservice = new PreAuthService();
const benefitService = new BenefitService();

const PreAuthIPDListComponent = () => {
  const navigate = useNavigate();
  const providerId = localStorage.getItem("providerId");
  const [benefits, setBenefits] = useState();
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });

  let pas$ = claimservice.getDashboardCount(providerId);
  let bts$ = benefitService.getAllBenefit({ page: 0, size: 100000 });

  // const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = benefitService
      .getAllBenefit({ page: 0, size: 100000 })
      .subscribe((result) => {
        setBenefits(result.content);
      });
    return () => subscription.unsubscribe();
  }, []);
  // };

  // useObservable(bts$, setBenefits);

  React.useEffect(() => {
    pas$.subscribe((result) => {
      setCount(result?.data);
    });
  }, []);
  // console.log("benefits", benefits);
  const columnsDefinations = [
    {
      field: "id",
      headerName: "Pre-Auth No.",
      body: (rowData) => (
        <span
          style={{
            lineBreak: "anywhere",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate(`/view/${rowData?.id}?mode=viewOnly&type=preauth`);
          }}
        >
          {rowData.id}
        </span>
      ),
    },
    { field: "memberShipNo", headerName: "Membership No." },
    {
      field: "memberName",
      headerName: "Name",
      body: (rowData) => (
        <span>
          {rowData.memberName}
          {rowData.vip && (
            <VIPDot/>
          )}
          {rowData.political && (
            <PoliticalDot/>
          )}
        </span>
      ),
    },
    { field: "policyNumber", headerName: "Policy No." },
    { field: "admissionDate", headerName: "Admission Date" },
    { field: "dischargeDate", headerName: "Discharge Date" },
    {
      field: "estimatedCose",
      headerName: "Estimated Cost",
      body: (rowData) => (
        <span>
          {rowData.benefitsWithCost?.map((el) => {
            let name = benefits.find((item) => item.id === el?.benefitId).name;
            console.log(name);
            return (
              <>
                <div>
                  <span>{name}</span>&nbsp; :&nbsp;
                  <span>{el?.estimatedCost}</span>
                </div>
              </>
            );
          })}
        </span>
      ),
    },
    // {
    //   field: "vip",
    //   headerName: "Is Vip ?",
    //   body: (rowData) => <span>{rowData.vip ? "Yes" : "No"}</span>,
    // },
    // {
    //   field: "political",
    //   headerName: "Is Political ?",
    //   body: (rowData) => <span>{rowData.political ? "Yes" : "No"}</span>,
    // },
    {
      field: "status",
      headerName: "Status",
      body: (rowData) => (
        <Tooltip
          title={
            rowData?.status === "Document Requested" && rowData?.addDocRemark
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                backgroundColor: getColor(rowData.status).background,
                // opacity: '0.9',
                color: getColor(rowData.status).color
                  ? getColor(rowData.status).color
                  : "#3c3c3c",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "8px",
                padding: "6px",
              }}
            >
              {rowData.status}
            </span>
          </div>
        </Tooltip>
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
    }
  ) => {
    // pageRequest.sort = ["rowCreatedDate dsc"];
    let isSearched = false;
    let providerId = localStorage.getItem("providerId");
    if (pageRequest.searchKey) {
      isSearched = true;
      pageRequest["memberShipNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["preAuthStatus"] = pageRequest.searchKey.toUpperCase();
      pageRequest["policyNumber"] = pageRequest.searchKey.toUpperCase();
      pageRequest["id"] = pageRequest.searchKey.toUpperCase();
      pageRequest["memberName"] = pageRequest.searchKey.toUpperCase();
      (pageRequest["preAuthType"] = "IPD"),
        (pageRequest["providerId"] = providerId),
        delete pageRequest.searchKey;
    }

    if (!isSearched) {
      pageRequest["preAuthType"] = "IPD";
      pageRequest["summary"] = true;
      pageRequest["active"] = true;
    }

    return isSearched
      ? claimservice.getFilteredPreauth(pageRequest, providerId).pipe(
          map((data) => {
            let content = data?.data?.content;
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
        )
      : claimservice.getAllPreauth(pageRequest, providerId).pipe(
          map((data) => {
            let content = data?.data?.content;
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
    navigate("/submit-preauth?mode=create");
  };

  const openDocumentsSection = (preAuth) => {
    navigate(`/submit-preauth/${preAuth?.id}?addDoc=true&mode=edit`);
  };

  const openEditSection = (preAuth) => {
    navigate(`/submit-preauth/${preAuth.id}?mode=edit`);
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
        onClick: openEditSection,
        tooltip: "Enhance",
      },
      // {
      //   key: "timeleine_preauth",
      //   icon: "pi pi-calendar-times",
      //   // className: classes.categoryButton,
      //   // onClick: openTimeLine,
      //   tooltip: "Timeleine",
      // },
      // {
      //   key: "claim_preauth",
      //   icon: "pi pi-money-bill",
      //   // className: classes.categoryButton,
      //   // disabled: disableClaimReimburse,
      //   // onClick: openReimbursement,
      //   tooltip: "Claim",
      // },
      // {
      //   key: "claim_preauth",
      //   icon: "pi pi-file-pdf",
      //   // className: classes.categoryButton,
      //   // disabled: disableAddDocs,
      //   onClick: openDocumentsSection,
      //   tooltip: "View Documents",
      // },
      {
        key: "claim_preauth",
        icon: "pi pi-paperclip",
        // className: classes.categoryButton,
        // disabled: disableAddDocs,
        onClick: openDocumentsSection,
        tooltip: "Add Documents",
      },
    ],

    header: {
      enable: true,
      // addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      addCreateButton: true,
      createBtnText: "Preauth",
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
