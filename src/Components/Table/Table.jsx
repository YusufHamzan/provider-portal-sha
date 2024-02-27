import React from "react";
import { Table as BsTable } from "react-bootstrap";

const Table = ({ headers = [], tableData = [] }) => {
    return (
        <div>
            <BsTable>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={`_${index}`}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData?.length > 0 &&
                        tableData.map((data, index) => (
                            <tr key={`_row${index}`}>
                                {Object.values(data)
                                    .flat(1)
                                    .map((value, index) => (
                                        <td key={`_cell${index}`}>{value}</td>
                                    ))}
                            </tr>
                        ))}
                </tbody>
            </BsTable>
            {tableData?.length === 0 && (
                <div style={{ textAlign: "center", padding: "10%" }}>
                    <h1>No Data Found</h1>
                </div>
            )}
        </div>
    );
};

export default Table;
