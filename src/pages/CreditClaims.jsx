import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { map } from "rxjs/operators";
import { PRE_AUTH_STATUS_MSG_MAP, REIM_STATUS_MSG_MAP } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import { Box, Button, Modal, Typography } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import React, { useEffect, useState } from "react";
import { CreditClaimService } from "../remote-api/api/claim-services/credit-claim-services";
import { PoliticalDot, VIPDot } from "../components/vip.dot";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { BenefitService } from "../remote-api/api/master-services/benefit-service";
import { useKeycloak } from "@react-keycloak/web";
import { jwtDecode } from "jwt-decode";

import { CloseOutlined } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

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
const utclongDate = (date) => {
  // console.log("date", dayjs(date).valueOf(), date)
  if (!date) return undefined;
  return dayjs(date).valueOf();
};
const claimservice = new CreditClaimService();
const benefitService = new BenefitService();

const CreditClaims = () => {
  let providerId = localStorage.getItem("providerId");
  const navigate = useNavigate();
  const [benefits, setBenefits] = useState();
  const [fromExpectedDOA, setFromExpectedDOA] = React.useState(null);
  const [toExpectedDOA, setToExpectedDOA] = React.useState(null);
  const [fromExpectedDOD, setFromExpectedDOD] = React.useState(null);
  const [toExpectedDOD, setToExpectedDOD] = React.useState(null);
  const [fromDate, setFromDate] = React.useState(null);
  const [toDate, setToDate] = React.useState(null);
  const [searchType, setSearchType] = React.useState();
  const [searchModal, setSearchModal] = React.useState(false);
  const [reloadTable, setReloadTable] = React.useState(false);
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });

  const { keycloak } = useKeycloak();
  let token = window["getToken"] && window["getToken"]();
  const { name } = jwtDecode(token);

  
  useEffect(() => {
    let subscription = benefitService
      .getAllBenefit({ page: 0, size: 100000 })
      .subscribe((result) => {
        setBenefits(result.content);
      });
    return () => subscription.unsubscribe();
  }, []);

  const handleProvider = (rowData) => {
    const invoiceProviders = rowData.invoices.map((inv) => {
      return (
        <Typography sx={{ fontSize: "12px" }}>{`${name}: ${
          inv.invoiceAmount || 0
        }`}</Typography>
      );
    });

    return <SimpleTreeView>{invoiceProviders}</SimpleTreeView>;
  };

  const renderBenefitWithCost = (rowData) => {
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
            <Typography sx={{ fontSize: "12px" }}>{`Unknown: ${
              ben?.estimatedCost || null
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
          itemId="grid"
          label={
            <Typography
              sx={{ fontSize: "12px" }}
            >{`Benifits: ${totalAmount}`}</Typography>
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
      headerName: "Claim No.",
      body: (rowData) => (
        <span
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => {
            navigate(`/view/${rowData?.id}?mode=viewOnly&type=creditClaim`);
          }}
          // onClick={() => handleMembershipClick(rowData, "membershipNo")}
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
    { field: "policyNumber", headerName: "Policy", expand: true },
    { field: "admissionDate", headerName: "Admission Date", expand: true },
    { field: "dischargeDate", headerName: "Discharge Date", expand: true },
    {
      field: "provider",
      headerName: "Providers & Cost",
      body: handleProvider,
    },
    {
      field: "benefitWithCost",
      headerName: "Benefit & Cost",
      body: renderBenefitWithCost,
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
    }
  ) => {
    // pageRequest.sort = ["rowCreatedDate dsc"];
    let isSearched = false;
    let providerId = localStorage.getItem("providerId");
    if (pageRequest.searchKey) {
      isSearched = true;
      pageRequest["memberShipNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["claimStatus"] = pageRequest.searchKey.toUpperCase();
      pageRequest["policyNo"] = pageRequest.searchKey.toUpperCase();
      pageRequest["id"] = pageRequest.searchKey.toUpperCase();
      pageRequest["memberName"] = pageRequest.searchKey.toUpperCase();
      (pageRequest["providerId"] = providerId), delete pageRequest.searchKey;
    }

    if (!isSearched) {
      // pageRequest["preAuthType"] = "IPD";
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
        startDate: utclongDate(fromDate),
        endDate: toDate ? utclongDate(toDate) : utclongDate(fromDate),
      },
    };

    const pagerequestquery = {
      page: pageRequest.page,
      size: pageRequest.size,

      // summary: true,
      // active: true,
      // providerId: providerId,
      ...(searchType && querytype[searchType]),
      providerId: providerId,

    };

    if (searchType) {
      return claimservice.getClaimdata(pagerequestquery, providerId).pipe(
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
            .getFilteredClaimReim(
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
            .getClaimReim(
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
  };

  const handleOpen = () => {
    navigate("/submit-claim?type=credit&mode=create");
  };

  const openEditSection = (reim) => {
    navigate(`/submit-claim/${reim.id}?type=credit&mode=edit`);
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
  const configuration = {
    enableSelection: false,
    scrollHeight: "300px",
    pageSize: 10,
    rowExpand: true,
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
      selectionMenus: [
        { icon: "", text: "Admission Date", onClick: preAuthDOASearch },
        { icon: "", text: "Discharge Date", onClick: preAuthDODSearch },
        { icon: "", text: "Creation Date", onClick: preAuthCreationSearch },
      ], //   selectionMenuButtonText: "Action"      //   selectionMenuButtonText: "Action"
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            margin="normal"
                            id="date-picker-inline"
                            // label="Enrolment Date"
                            autoOk={true}
                            value={fromDate}
                            onChange={(date) => setToDate(date)}
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
                            value={toDate}
                            onChange={(date) => setToDate(date)}
                            KeyboardButtonProps={{
                              "aria-label": "change ing date",
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
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

export default CreditClaims;
