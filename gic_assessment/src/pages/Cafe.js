import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Pagination } from 'antd';
import "./index.css";

function Cafe() {
    const [rowData, setRowData] = useState([]);

    const [colDefs, setColDefs] = useState([
        {   
            field: "logo",
            headerName: "Logo",
            cellRenderer: (params) => (
                <img
                    src={params.value}
                    alt="Logo"
                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "8px" }}
                />
            )
        },
        {   
            field: "name",
            headerName: "Name"
         },
        {
            field: "description",
            headerName: "Description"
        },
        { 
            field: "Employee_Count",
            headerName: "Employee Count"
        },
        {
            field: "location",
            headerName: "Location"
        }
    ]);

    async function getData() {
        try {
            const response = await fetch("/cafes");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getDataWithLocation(location) {
        try {
            const response = await fetch(`/cafes?location=${location}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="Grid-div" style={{width: "96%", height: "75vh"}}>
            <h1>Cafe</h1>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
            />

            <Pagination defaultCurrent={1} total={50} />
        </div>
    );
}

export default Cafe;
