import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Select, Modal, Form, Input } from 'antd';
import { Link, useNavigate } from "react-router";
import "../index.css";

function Cafe() {
    const navigate = useNavigate();

    const [locationList, setLocationList] = useState([]);
    const [rowData, setRowData] = useState([]);

    const [colDefs, setColDefs] = useState([
        {   
            field: "logo",
            headerName: "Logo",
            cellRenderer: (params) => (
                params.value == "" ? <div></div> : <img
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
        },
        {
            field: "id",
            headerName: "Actions",
            cellRenderer: (params) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        type="primary"
                        onClick={() => handleEdit(params.data)}
                        >
                        Edit
                    </Button>
                    <Button danger
                        onClick={() => handleDelete(params.data)}
                        >
                        Delete
                    </Button>
                </div>
            ),
        }
    ]);

    const [selectedCafe, setSelectedCafe] = useState("");
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const showDeleteModal = () => {
        setIsModalDeleteOpen(true);
    };
    const handleDeleteOk = () => {
        deleteCafeFunc(selectedCafe.name)
        setIsModalDeleteOpen(false);
    };
    const handleDeleteCancel = () => {
        setIsModalDeleteOpen(false);
    };

    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const showEditModal = () => {
        setIsModalEditOpen(true);
    };
    const handleEditOk = () => {
        updateCafeFunc(selectedCafe.id)
        setIsModalEditOpen(false);
    };
    const handleEditCancel = () => {
        setIsModalEditOpen(false);
    };

    async function getData() {
        try {
            const response = await fetch("/cafes");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();

            const unique = [...new Map(result.map(item => [item.location, {value:item.location, label:item.location}])).values()];
            setLocationList(unique);
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

    async function updateCafeFunc(id) {
        const updatedData = form.getFieldsValue();
        const formData = new FormData();
        formData.append('name', updatedData.name);
        formData.append('description', updatedData.description);
        if (updatedData.logo == undefined) {
            formData.append('logo', "");
        } else {
            formData.append('logo', updatedData.logo);
        }
        formData.append('location', updatedData.location);

        try {
            const response = await fetch(`/cafes/${id}`, {
                method: "PUT",
                body: formData
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
        } catch (error) {
            console.error(error.message);
        }

        window.location.reload();
    }

    async function deleteCafeFunc(name) {
        try {
            const response = await fetch(`/cafes/${name}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
        } catch (error) {
            console.error(error.message);
        }

        window.location.reload();
    }

    function onChange(e) {
        getDataWithLocation(e);
    }

    const [form] = Form.useForm();

    function handleEdit(data) {
        setSelectedCafe(data);
        showEditModal();

        form.setFieldsValue({
            name: data.name,
            description: data.description,
            logo: data.logo,
            location: data.location
        })
    }

    function handleDelete(data) {
        setSelectedCafe(data);
        showDeleteModal();
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="Grid-div" style={{width: "96%", height: "75vh"}}>
            <h1>Cafe</h1>

            <div className="Grid-header">
                <Link to="./add"><Button type="primary">Add New Cafe</Button></Link>

                <Select
                    style={{ width: 120 }}
                    onChange={onChange}
                    options={locationList}
                />
            </div>

            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                rowSelection="single"
                onRowClicked={(event) => {
                    navigate(`/employees`, {state: {cafe: event.data.name}});
                }}
            />

            <Form
                form={form}
                name="edit"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                autoComplete="off"
            >
                <Modal
                    title="Edit Cafe"
                    closable={{ 'aria-label': 'Edit' }}
                    open={isModalEditOpen}
                    onOk={handleEditOk}
                    onCancel={handleEditCancel}
                    footer={[
                        <Button key="cancel" onClick={handleEditCancel}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleEditOk}>
                            Save
                        </Button>
                    ]}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input a name!' }]}
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input a description!' }]}
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                        label="Logo"
                        name="logo"
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                        label="Location"
                        name="location"
                        rules={[{ required: true, message: 'Please input a location!' }]}
                    >
                    <Input />
                    </Form.Item>
                </Modal>
            </Form>

            <Modal
                title="Delete Cafe"
                closable={{ 'aria-label': 'Delete' }}
                open={isModalDeleteOpen}
                onOk={handleDeleteOk}
                onCancel={handleDeleteCancel}
                footer={[
                    <Button key="cancel" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>,
                    <Button danger key="submit" type="primary" onClick={handleDeleteOk}>
                        Delete
                    </Button>
                ]}
            >
                <p>Are you sure you want to delete {selectedCafe.name}?</p>
            </Modal>
        </div>
    );
}

export default Cafe;
