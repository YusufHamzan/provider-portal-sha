import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import moment from "moment";
import _ from "lodash";
import { Box, Button } from "@mui/material";
import { useImmer } from "use-immer";
import { getPreAuthList } from "../../API/cmsForPreauth";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";

const getColor = status => {
    switch (status) {
      case 'PENDING_EVALUATION':
        return { background: 'rgba(149,48,55,0.5)', border: 'rgba(149,48,55,1)' };
      case 'EVALUATION_INPROGRESS':
        return { background: 'rgba(255, 252, 127, 0.5)', border: 'rgba(255, 252, 255, 1)' };
      case 'REQUESTED':
        return { background: 'rgba(4, 59, 92, 0.5)', border: 'rgba(4, 59, 92, 1)', color:"#f1f1f1" };
      case 'APPROVED':
        return { background: 'rgba(1, 222, 116, 0.5)', border: 'rgba(1, 222, 116, 1)' };
      case 'REJECTED':
        return { background: 'rgba(255,50,67,0.5)', border: 'rgba(255,50,67,1)' };
      case 'ADD_DOC_REQUESTED':
        return { background: 'rgba(165, 55, 253, 0.5)', border: 'rgba(165, 55, 253, 1)' };
      case 'APPROVED_FAILED':
        return { background: 'rgb(139, 0, 0,0.5)', border: 'rgb(139, 0, 0)' };
      case 'DRAFT':
        return { background: 'rgba(128,128,128,0.5)', border: 'rgba(128,128,128,1)' };
      case 'WAITING_FOR_CLAIM':
        return { background: 'rgba(245, 222, 179, 0.5)', border: 'rgba(245, 222, 179,1)' };
      case 'CANCELLED':
        return { background: 'rgba(149,48,55,0.5)', border: 'rgba(149,48,55,1)' };
      case 'REVERTED':
        return { background: 'rgba(241, 241, 241, 0.5)', border: 'rgba(241, 241, 241, 1)' };
      default:
        return { background: 'rgba(227, 61, 148, 0.5)', border: 'rgba(227, 61, 148, 1)' };
    }
  };

const CmsForPreAuth = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMoreData();
    }, []);

    const fetchMoreData = async () => {
        let payload = {
            page: 0,
            size: "10",
            summary: true,
            active: true,
            preAuthType: "IPD",
            sort: "rowCreatedDate dsc",
        };
        const result = getPreAuthList(payload);
        result
            .then((data) => {
                console.log(data);
                const flattenedRows = data?.data.content.map((row) => ({
                    id: row.id,
                    preAuthType: row.preAuthType,
                    preAuthStatus: row.preAuthStatus,
                    policyNumber: row.policyNumber,
                    memberShipNo: row.memberShipNo,
                    memberName: row.memberName,
                    admissionDate: row.timeLine[0]?.dateTime,
                    dischargeDate: row.timeLine[row.timeLine.length - 1]?.dateTime,
                    status: row.timeLine[row.timeLine.length - 1]?.status,
                }));
                setRows(flattenedRows);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const columns = [
        {
            field: "id",
            headerName: "Claim No.",
            flex: 1,
        },
        { field: "memberShipNo", headerName: "Membership No.", flex: 1 },
        { field: "memberName", headerName: "Name", flex: 1 },
        { field: "preAuthType", headerName: "PreAuth Type", flex: 1 },
        { field: "policyNumber", headerName: "Policy No.", flex: 1 },
        {
            field: "admissionDate",
            headerName: "Admission Date",
            renderCell: (params) => <span>{moment(params.value).format("DD/MM/YYYY")}</span>,
            flex: 1,
        },
        {
            field: "dischargeDate",
            headerName: "Discharge Date",
            renderCell: (params) => <span>{moment(params.value).format("DD/MM/YYYY")}</span>,
            flex: 1,
        },
        {
            field: "preAuthStatus",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <span
                    style={{
                        backgroundColor: getColor(params.value).background,
                        // opacity: '0.9',
                        color: getColor(params.value).color ? getColor(params.value).color : "#3c3c3c",
                        border: "1px solid",
                        borderColor: getColor(params.value).border,
                        borderRadius: "8px",
                        padding: "4px",
                    }}
                >
                    {params.value}
                </span>
            ),
        },
    ];

    return (
        <>
            <div className="d-flex justify-content-end mb-1">
                <Link to={`/submitpreauth`}>
                    <Button variant="contained">Create</Button>
                </Link>
            </div>
            <div style={{ height: 600, width: "100%" }}>
                <DataGrid rows={rows} columns={columns} loading={loading} />
            </div>
        </>
    );
};

export default CmsForPreAuth;
