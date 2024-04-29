import LinearProgress from "@mui/material/LinearProgress";
import { withStyles } from "@mui/material";
import { Button as PButton } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { Fragment, useEffect, useState } from "react";
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from "rxjs/operators";
import "./abc.css";
import Eo2v2ActionMenu from "./eo2v2.action.menu";
import { Eo2v2SearchBox } from "./eo2v2.search.box";
import { styled } from "@mui/material/styles";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import "primeflex/primeflex.css";
import { Grid } from "@mui/material";
import Eo2v2DataGridPropTypes from "./Eo2v2.data.grid.props.types";
import toWords from "split-camelcase-to-words";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

let lastSearchKey = "";

export const Eo2v2DataGrid = (props) => {
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(props.config.pageSize || 10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(null);
  const [scrollHeight, setScrollHeight] = useState("");

  const renderGrid = (pageData) => {
    // setTotalRecords(pageData.totalElements);
    // setItems(pageData.content);
    // setLoading(false);
    if (Array.isArray(pageData.content)) {
      setTotalRecords(pageData.totalElements);
      setItems(pageData.content);
      setLoading(false);
    } else {
      console.error("Invalid data format: 'pageData.content' is not an array");
    }
    y;
  };
  
  useEffect(() => {
    if (props.hasOwnProperty("selectedId")) {
      renderGrid({ totalElements: 0, content: [] });
    } else {
      props.$dataSource().subscribe(renderGrid);
    }
    setScrollHeight("520px"); //props.config.scrollHeight
  }, []);

  useEffect(() => {
    if (props.selectedId) {
      props.$dataSource().subscribe(renderGrid);
    }
    if (props.reloadTable) {
      setLoading(true);
      props.$dataSource().subscribe(renderGrid);
    }
  }, [props.selectedId, props.reloadTable]);

  const buildSearchBox = () => {
    const s = new Subject();
    const observable = s.asObservable();

    observable
      .pipe(filter((searchTerm) => searchTerm && searchTerm?.length > 2))
      .pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .pipe(
        switchMap((searchKey) => {
          lastSearchKey = searchKey;
          setLoading(true);
          return props.$dataSource({ searchKey, page: 0, size: rows });
        })
      )
      .subscribe(renderGrid);

    const onChange = (data) => {
      if (!data && !!lastSearchKey) {
        lastSearchKey = data;
        props
          .$dataSource({ searchKey: data, page: 0, size: rows })
          .subscribe(renderGrid);
        // props.$dataSource({ page: 0, size: rows }).subscribe(renderGrid);
      } else {
        s.next(data);
      }
    };

    return (
      <Eo2v2SearchBox
        onChange={onChange}
        label={props.config.header.searchText}
      />
    );
  };

  const buildEo2v2ActionMenu = () => {
    return (
      <Eo2v2ActionMenu
        menus={props.config.header.selectionMenus}
        title={props.config.header.selectionMenuButtonText}
      ></Eo2v2ActionMenu>
    );
  };

  const setCreateBtnBrkPnt = (breakPoint) => {
    if (
      props.config.header.selectionMenus &&
      props.config.header.selectionMenus?.length > 0
    ) {
      if (breakPoint === "lg") {
        return 1;
      } else {
        return 2;
      }
    } else {
      if (breakPoint === "lg") {
        return 5;
      } else {
        return 4;
      }
    }
  };

  function isValidDate(timestamp) {
    const date = new Date(timestamp);

    return date.toString() !== "Invalid Date";
  }

  const exportExcel = () => {
    setLoading(true);
    const convertedData = items.map((obj) => {
      const convertedObj = {};
      for (const key in obj) {
        if (key.toLowerCase().includes("date") && isValidDate(obj[key])) {
          const date = new Date(obj[key]);
          const formattedDate = `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`;
          convertedObj[toWords(key)] = formattedDate;
        } else {
          convertedObj[toWords(key)] = obj[key];
        }
      }
      return convertedObj;
    });

    import("xlsx").then((xlsx) => {
      const workSheet = xlsx.utils.json_to_sheet(convertedData);
      const workBook = { Sheets: { data: workSheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workBook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, "data");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import("file-saver").then((FileSaver) => {
      let EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      let EXCEL_EXTENSION = ".xlsx";
      const data = new Blob([buffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(
        data,
        fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
      );
      setLoading(false);
    });
  };

  const renderHeader = () => {
    if (props.config.header && props.config.header.enable)
      return (
        <div className="flex align-items-center flex-wrap row-gap-2">
          <div className="w-full lg:w-auto">
            <h3>{props.config.header.text}</h3>
          </div>
          <div className="w-full lg:w-auto md:flex-1 md:justify-content-center md:flex px-2 md:px-6 lg:px-12">
            {props.config.header.enableGlobalSearch && buildSearchBox()}
          </div>
          <div className="w-full lg:w-auto flex justify-content-end align-items-center">
            {props.config.header.enableDownload && (
              <PButton
                tooltip={"Excel Download"}
                tooltipOptions={{
                  position: "bottom",
                  mouseTrack: true,
                  mouseTrackTop: 15,
                }}
                style={{ width: "32px", height: "32px", marginRight: "4px" }}
                severity="secondary"
                rounded
                raised
                text
                outlined
                icon={"pi pi-file-excel"}
                onClick={exportExcel}
              />
            )}
            {props.config.header.selectionMenus && buildEo2v2ActionMenu()}
            {props.config.header.addCreateButton && (
              <PButton
                tooltip={!props.config.header.createButtonText && "Create"}
                tooltipOptions={{
                  position: "bottom",
                  mouseTrack: true,
                  mouseTrackTop: 15,
                }}
                style={{ width: !props.config.header.createBtnText && "32px", height: "32px", background:props.config.header.createBtnText && "#313c96", color: props.config.header.createBtnText && "#fff" }}
                severity="secondary"
                rounded
                raised
                text
                outlined
                icon={props.config.header.createButtonIcon || "pi pi-plus"}
                onClick={() => {
                  typeof props.config.header.onCreateButtonClick ===
                    "function" && props.config.header.onCreateButtonClick();
                }}
              >
                <span style={{marginLeft:"4px"}}>{props.config.header.createBtnText &&
                  `Create ${props.config.header.createBtnText}`}</span>
              </PButton>
            )}
          </div>
        </div>
      );
  };

  const onPage = (event) => {
    setLoading(true);
    const startIndex = event.first;
    setFirst(startIndex);

    if (rows != event.rows) {
      setRows(event.rows);
    }
    props
      .$dataSource({
        page: event.page,
        size: event.rows,
        searchKey: lastSearchKey,
      })
      .subscribe((page) => {
        setItems(page.content);
        setLoading(false);
      });
  };

  const accept = (button, rowData) => {
    Object.prototype.toString.call(button.onClick) == "[object Function]" &&
      button.onClick(rowData);
  };

  const reject = () => {};

  const confirm = (event, button, rowData) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Are you sure you want to ${
        button.tooltip ? button.tooltip : "proceed"
      }?`,
      icon: "pi pi-exclamation-triangle",
      accept: () => accept(button, rowData),
      reject: () => reject(button),
    });
  };

  const actionTemplate = (rowData, column) => {
    return (
      <Grid container>
        {props.config.actionButtons.map((button, id) => (
          <Grid item xs={6} style={{ gap: "10px" }} key={`acbtns-${id}`}>
            <PButton
              key={`acbtns-${id}`}
              rounded
              text
              type="button"
              label={button?.label}
              icon={button.icon}
              tooltipOptions={{
                showOnDisabled: true,
                mouseTrack: true,
                position: "left",
              }}
              tooltip={button.tooltip && !button.disabled ? button.tooltip : ""}
              disabled={button.disabled && button.disabled(rowData)}
              // className={button.className}
              severity={button.severity ? button.severity : ""}
              // style={{ flexBasis: '50%', boxSizing: 'border-box' }}
              onClick={(e) => {
                e.stopPropagation();
                if (props?.isCopy) accept(button, rowData);
                else if (props?.config?.disableConfirm) accept(button, rowData);
                else confirm(e, button, rowData);
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const progressTemplate = (rowData) => {
    return (
      <BorderLinearProgress
        variant="determinate"
        value={rowData.progressPercentage ? rowData.progressPercentage : 0}
      />
    );
  };

  const columnDefination = (column) => {
    let handleCellEditComplete = null;

    if (props?.config?.editCell) {
      handleCellEditComplete = column.onCellEditComplete
        ? column.onCellEditComplete
        : null;
    }

    return (
      <Column
        field={column.field}
        key={column.field}
        header={column.headerName}
        body={column.body}
        style={column.style}
        headerStyle={column.headerStyle}
        bodyStyle={column.bodyStyle}
        editor={props?.config?.editCell && column.editor ? column.editor : null}
        onCellEditComplete={(e) =>
          onCellEditComplete(e, handleCellEditComplete)
        }
      ></Column>
    );
  };

  const buildActionColumn = () => {
    return (
      <Column
        header="Action"
        key="action"
        body={actionTemplate}
        style={{ width: "6rem" }}
      ></Column>
    );
  };

  const buildProgressColumn = () => {
    return (
      <Column header="Progress" key="progress" body={progressTemplate}></Column>
    );
  };

  const buildColumns = () => {
    let columns = [];
    if (props.config.enableSelection) {
      const mode = props.config.singleSelectionMode ? "single" : "multiple";
      let selectionColumn = (
        <Column selectionMode={mode} style={{ width: "3em" }} key="id" />
      );
      columns.push(selectionColumn);
    }

    props.columnsDefination
      .map(columnDefination)
      .forEach((item) => columns.push(item));

    if (props.config && props.config.progressColumn) {
      columns.push(buildProgressColumn());
    }

    if (
      props.config &&
      props.config.actionButtons &&
      props.config.actionButtons?.length > 0
    ) {
      columns.push(buildActionColumn());
    }

    return columns;
  };

  const onSelectionChange = (e) => {
    setSelectedItems(e.value);
    props.config.header?.enable &&
      typeof props.config.header.onSelectionChange === "function" &&
      props.config.header.onSelectionChange(e.value);
  };

  const rowClassName = (data) => {
    return isSelectable(data.id, "id") ? "" : "p-disabled";
  };

  const isSelectable = (value, field) => {
    let isSelectable = true;
    if (field === "id" && value === "1001") {
      isSelectable = false;
    }

    return isSelectable;
  };

  const isRowSelectable = (event) => {
    const data = event.data;
    return isSelectable(data.id, "id");
  };

  const onCellEditComplete = (e, columnOnCellEditComplete) => {
    let _products = [...items];
    let {
      newRowData,
      rowIndex,
      rowData,
      newValue,
      field,
      originalEvent: event,
    } = e;
    // if (newValue?.trim().length > 0) { //this worked
    //   // rowData[field] = newValue;
    _products[rowIndex] = { ...newRowData };
    setItems(_products);

    if (columnOnCellEditComplete) {
      columnOnCellEditComplete(e, _products);
    }
    // } else { //this worked
    //   event.preventDefault();
    // }
  };

  const onRowEditComplete = (e) => {
    let _products = [...items];
    let { newData, index } = e;
    _products[index] = newData;
    setItems(_products);
    props.config.editRows &&
      typeof props.config.onRowEditComplete === "function" &&
      props.config.onRowEditComplete(e, _products);
  };

  useEffect(() => {
    const onLoadedData = (items) => {
      if (
        props.config.onLoadedData &&
        typeof props.config.onLoadedData === "function"
      ) {
        props.config.onLoadedData(items);
      }
    };
    onLoadedData(items);
  }, [items]);

  return (
    // <div style={{ backgroundColor: 'var(--surface-f)', borderRadius: '0 0 8px 8px' }}>
    <div>
      <ConfirmPopup />
      <DataTable
        header={renderHeader()}
        dataKey="id"
        value={items}
        editMode={
          props?.config?.editRows
            ? "rows"
            : props?.config?.editCell
            ? "cell"
            : null
        }
        stripedRows
        size="small"
        style={props?.style}
        rows={rows}
        resizableColumns
        // showGridlines
        lazy
        onPage={onPage}
        loading={loading}
        scrollable
        scrollHeight={scrollHeight}
        selectionMode={props?.config?.rowClickDisable ? "checkbox" : null}
        selection={selectedItems}
        columnResizeMode="expand"
        onSelectionChange={onSelectionChange}
        isDataSelectable={isRowSelectable}
        onRowEditComplete={onRowEditComplete}
        data
        className={`custom-datatable`}
        emptyMessage="No data found"
        first={first}
        totalRecords={totalRecords}
        paginator={props.config.paginator === false ? false : 10}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        rowsPerPageOptions={[5, 10, 15, 20, 25, 50, 100]}
        tableStyle={{ minWidth: props?.width || "" }}
        {...props}
      >
        {buildColumns()}
      </DataTable>
    </div>
  );
};

// Eo2v2DataGrid.defaultProps = {
//   config: { actionButtons: [], pageSize: 10, enableSelection: true, header: null },
//   $dataSource: null,
//   columnsDefination: [],
// };

Eo2v2DataGrid.propTypes = Eo2v2DataGridPropTypes;
