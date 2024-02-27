import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";

const PreviewData = ({ data = [] }) => {
    const [tableHeaders] = useState([
        {
            dataField: "itemname",
            text: "Item Name",
        },
        {
            dataField: "quantity",
            text: "Quantity",
        },
        {
            dataField: "amount",
            text: "Amount",
        },
    ]);

    return (
        <div autofocus>
            {data.map((item) => (
                <>
                    <div>Invoice Number : {item.invoicenumber}</div>
                    {data?.length > 0 && (
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <BootstrapTable bootstrap4={true} keyField="itemcode" data={item.items} columns={tableHeaders} bordered={false} />
                        </div>
                    )}
                </>
            ))}
        </div>
    );
};

export default PreviewData;
