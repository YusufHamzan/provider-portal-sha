// https://github.com/YusufHamzan/provider-portal.git

import { Eo2v2DataGrid } from "../eo2v2.data.grid";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP } from "../../utils/helper";
import { Box, Button, Modal, Tooltip, Typography, styled } from "@mui/material";
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
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { CloseOutlined } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import moment from "moment/moment";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  background: "#fff",
  // border: '2px solid #000',
  boxShadow: 24,
  padding: "2% 3%",
};

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
        background: "#00539b",
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
  // console.log("date", dayjs(date).valueOf(), date)
  if (!date) return undefined;
  return dayjs(date).valueOf();
};
const claimservice = new PreAuthService();
const benefitService = new BenefitService();

const PreAuthOPDListComponent = () => {
  const navigate = useNavigate();
  const providerId = localStorage.getItem("providerId");
  const [benefits, setBenefits] = useState();
  const [searchModal, setSearchModal] = React.useState(false);
  const [searchType, setSearchType] = React.useState();
  const [fromExpectedDOA, setFromExpectedDOA] = React.useState(null);
  const [toExpectedDOA, setToExpectedDOA] = React.useState(null);
  const [fromExpectedDOD, setFromExpectedDOD] = React.useState(null);
  const [toExpectedDOD, setToExpectedDOD] = React.useState(null);
  const [fromDate, setFromDate] = React.useState(null);
  const [toDate, setToDate] = React.useState(null);
  const [reloadTable, setReloadTable] = React.useState(false);

  const onSearch = () => {
    setSearchModal(false);
    setReloadTable(true);
    setTimeout(() => {
      setReloadTable(false);
      // setSearchDischargeDate('');
      // setSearchAdmissionDate('');
      setFromExpectedDOA(null);
      setToExpectedDOA(null);
      setFromExpectedDOD(null);
      setToExpectedDOD(null);
      setFromDate(null);
      setToDate(null);
    }, [1000]);
  };
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });

  let pas$ = claimservice.getDashboardCount(providerId);

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

  // const handleProvider = (rowData) => {
  //   const length = rowData?.providers?.length
  //   const invoiceProviders = rowData?.providers?.map(prov => {
  //     const provider = providers.find(p => p.id === prov.providerId);

  //     if (provider) {
  //       if (prov.benefit.length) {
  //         return <TreeItem itemId={prov.providerId} label={<Typography sx={{ fontSize: '12px' }}>{`${provider?.providerBasicDetails?.name}: ${prov.estimatedCost}`}</Typography>}>
  //           {renderBenefitWithCost({ benefitsWithCost: prov.benefit })}
  //         </TreeItem>
  //       } else {
  //         return (
  //           <TreeItem itemId={prov.providerId} label={<Typography sx={{ fontSize: '12px' }}>{`${provider?.providerBasicDetails?.name}: ${prov.estimatedCost}`}</Typography>}></TreeItem>
  //         );
  //       }
  //     } else {
  //       return (
  //         <TreeItem itemId={prov.providerId} label={<Typography sx={{ fontSize: '12px' }}>{`Unknown: ${prov.estimatedCost || null}`}</Typography>}></TreeItem>
  //       );
  //     }
  //   });

  //   const totalAmount = rowData.providers.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  //   return (
  //     <SimpleTreeView>
  //       <TreeItem itemId="grid" label={<Typography sx={{ fontSize: '12px' }}>{`${length} ${length === 1 ? 'Provider: ' : 'Providers: '} ${totalAmount}`}</Typography>}>
  //         {invoiceProviders}
  //       </TreeItem>
  //     </SimpleTreeView >
  //   );
  // };

  const renderBenefitWithCost = (rowData) => {
    const length = rowData?.benefitsWithCost?.length;
    const benefitsWithCost = rowData.benefitsWithCost?.map((ben) => {
      const benefitName = benefits?.find(
        (item) => item.id === ben?.benefitId
      )?.name;
      return benefitName ? (
        <TreeItem
          itemId={ben?.benefitId}
          label={
            <Typography
              sx={{ fontSize: "12px" }}
            >{`${benefitName}: ${ben?.estimatedCost}`}</Typography>
          }
        ></TreeItem>
      ) : (
        <TreeItem
          itemId={ben?.benefitId}
          label={
            <Typography sx={{ fontSize: "12px" }}>{`Unknown: ${ben?.estimatedCost || null
              }`}</Typography>
          }
        ></TreeItem>
      );
    });

    const totalAmount = rowData.benefitsWithCost.reduce(
      (acc, curr) => acc + curr.estimatedCost,
      0
    );

    return (
      <SimpleTreeView>
        <TreeItem
          itemId="benefit"
          label={
            <Typography sx={{ fontSize: "12px" }}>{`${length} ${length === 1 ? "Benefit: " : "Benefits: "
              } ${totalAmount}`}</Typography>
          }
        >
          {benefitsWithCost}
        </TreeItem>
      </SimpleTreeView>
    );
  };

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
          {rowData.vip && <VIPDot />}
          {rowData.political && <PoliticalDot />}
        </span>
      ),
    },
    // {
    //   field: 'provider', headerName: 'Providers & Cost',
    //   body: handleProvider
    // },
    {
      field: "benefitWithCost",
      headerName: "Benefit & Cost",
      body: renderBenefitWithCost,
    },
    { field: "policyNumber", headerName: "Policy No.", expand: true },
    { field: "admissionDate", headerName: "Admission Date", expand: true },
    { field: "dischargeDate", headerName: "Discharge Date", expand: true },
    // {
    //   field: "estimatedCose",
    //   headerName: "Estimated Cost",
    //   body: (rowData) => (
    //     <span>
    //       {rowData.benefitsWithCost?.map((el) => {
    //         let name = benefits.find((item) => item.id === el?.benefitId).name;
    //         console.log(name);
    //         return (
    //           <>
    //             <div>
    //               <span>{name}</span>&nbsp; :&nbsp;
    //               <span>{el?.estimatedCost}</span>
    //             </div>
    //           </>
    //         );
    //       })}
    //     </span>
    //   ),
    // },
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
      preAuthType: "OPD",
      sort: ["rowCreatedDate dsc"]
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
      (pageRequest["preAuthType"] = "OPD"),
        (pageRequest["providerId"] = providerId),
        delete pageRequest.searchKey;
    }

    if (!isSearched) {
      pageRequest["preAuthType"] = "OPD";
      pageRequest["summary"] = true;
      pageRequest["active"] = true;
    }

    const querytype = {
      1: {
        fromExpectedDOA: utclongDate(fromExpectedDOA),
        toExpectedDOA: toExpectedDOA
          ? utclongDate(toExpectedDOA)
          : utclongDate(fromExpectedDOA),
      },
      2: {
        fromExpectedDOD: utclongDate(fromExpectedDOD),
        toExpectedDOD: toExpectedDOD
          ? utclongDate(toExpectedDOD)
          : utclongDate(fromExpectedDOD),
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
      sort: ["rowCreatedDate dsc"],
      preAuthType: "OPD",
      providerId: providerId,
      ...(searchType && querytype[searchType]),
    };

    if (searchType) {
      return claimservice.getAdvancedFilteredPreauth(pagerequestquery).pipe(
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
    } else {
      return isSearched
        ? claimservice
          .getFilteredPreauth(
            searchType ? pagerequestquery : pageRequest,
            providerId
          )
          .pipe(
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
        : claimservice
          .getAllPreauth(
            searchType ? pagerequestquery : pageRequest,
            providerId
          )
          .pipe(
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
    }
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
    navigate("submit-preauth?mode=create&type=opd");
  };

  const openDocumentsSection = (preAuth) => {
    navigate(`submit-preauth/${preAuth?.id}?addDoc=true&mode=edit&type=opd`);
  };

  const openEditSection = (preAuth) => {
    navigate(`submit-preauth/${preAuth.id}?mode=edit&type=opd`);
  };

  const preAuthDOASearch = (type) => {
    setSearchModal(true);
    setSearchType(1);
  };

  const preAuthDODSearch = (type) => {
    setSearchModal(true);
    setSearchType(2);
  };
  const preAuthCreationSearch = (type) => {
    setSearchModal(true);
    setSearchType(3);
  };

  const clearAllClick = () => {
    setFromExpectedDOA("");
    setToExpectedDOA("");
    setFromExpectedDOD("");
    setToExpectedDOD("");
    setFromDate("");
    setToDate("");
    setSearchType();
    setReloadTable(true);
  };

  const configuration = {
    enableSelection: false,
    scrollHeight: "285px",
    rowExpand: true,
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
      text: "Pre-Auth - OPD",
      enableGlobalSearch: true,
      searchText:
        "Search by Claim No, Membership No, Name, Policy id or Status",
      selectionMenus: [
        { icon: "", text: "Admission Date", onClick: preAuthDOASearch },
        { icon: "", text: "Discharge Date", onClick: preAuthDODSearch },
        { icon: "", text: "Creation Date", onClick: preAuthCreationSearch },
        { icon: "", text: "Clear All", onClick: clearAllClick },
      ],
      // selectionMenus: [
      //   { icon: "", text: "Admission Date" },
      //   { icon: "", text: "Discharge Date" },
      //   { icon: "", text: "Creation Date" },
      //   { icon: "", text: "Clear All" },
      // ],
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
        reloadTable={reloadTable}
      />

      <Modal
        open={searchModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box style={modalStyle}>
          <Box>
            <Box id="alert-dialog-slide-description">
              {searchType == 1 && (
                <>
                  <Box display={"flex"} justifyContent={"space-between"}>
                    <Box component="h3" marginBottom={"10px"}>
                      Search By Date of Admission
                    </Box>
                    <CloseOutlined
                      onClick={() => setSearchModal(false)}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                  <Box display={"flex"} marginBottom={"10px"}>
                    <Box display={"flex"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOA}
                            onChange={(date) => setFromExpectedDOA(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={fromExpectedDOA}
                            onChange={(date) => setFromExpectedDOA(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    <Box display={"flex"} marginLeft={"3%"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOA}
                            onChange={(date) => setToExpectedDOA(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={toExpectedDOA}
                            onChange={(date) => setToExpectedDOA(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 2 && (
                <>
                  <Box display={"flex"} justifyContent={"space-between"}>
                    <Box component="h3" marginBottom={"10px"}>
                      Seach by Date of Discharge
                    </Box>
                    <CloseOutlined
                      onClick={() => setSearchModal(false)}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                  <Box display={"flex"} marginBottom={"10px"}>
                    <Box display={"flex"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={fromExpectedDOD}
                            onChange={(date) => setFromExpectedDOD(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOD}
                            onChange={(date) => setFromExpectedDOD(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                      </Box>
                    </Box>
                    <Box display={"flex"} marginLeft={"3%"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOD}
                            onChange={(date) => setToExpectedDOD(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={toExpectedDOD}
                            onChange={(date) => setToExpectedDOD(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 3 && (
                <>
                  <Box display={"flex"} justifyContent={"space-between"}>
                    <Box component="h3" marginBottom={"10px"}>
                      Search By Creation Date
                    </Box>
                    <CloseOutlined
                      onClick={() => setSearchModal(false)}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                  <Box display={"flex"} marginBottom={"10px"}>
                    <Box display={"flex"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={fromDate}
                            onChange={(date) => setFromDate(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromDate}
                            onChange={(date) => setFromDate(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                      </Box>
                    </Box>
                    <Box display={"flex"} marginLeft={"3%"}>
                      <Typography
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: "flex", alignItems: "center" }}>
                        :
                      </span>
                      &nbsp;
                      <Box style={{ marginBottom: "10px" }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={["year", "month", "date"]}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toDate}
                            onChange={(date) => setToDate(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={toDate}
                            onChange={(date) => setToDate(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <Box marginTop={"10%"}>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#313c96",
                color: "#fff",
              }}
              onClick={onSearch}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PreAuthOPDListComponent;
