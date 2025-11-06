import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Select } from 'antd';
import "./index.css";

function Cafe() {
    const [locationList, setLocationList] = useState([]);
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

            const unique = [...new Map(result.map(item => [item.location, {value:item.location, label:item.location}])).values()];
            console.log(unique);
            setLocationList(unique);
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getDataWithLocation(location) {
        try {
            const response = await fetch(`/cafes?location="${location}"`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    function onChange(e) {
        getDataWithLocation(e);
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="Grid-div" style={{width: "96%", height: "75vh"}}>
            <h1>Cafe</h1>

            <div className="Grid-header">
                <Button type="primary">Add New Cafe</Button>

                <Select
                    style={{ width: 120 }}
                    onChange={onChange}
                    options={locationList}
                />
            </div>

            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
            />
        </div>
    );
}

export default Cafe;
