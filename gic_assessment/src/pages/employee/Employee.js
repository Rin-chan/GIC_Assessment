import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Select, Modal, Form, Input, Radio, Flex } from 'antd';
import { Link } from "react-router";
import "../index.css";

function Employee() {
    const [value, setValue] = useState(0);
    const onGenderChange = e => {
        setValue(e);
    };

    const [locationList, setLocationList] = useState([]);
    const [rowData, setRowData] = useState([]);

    const [colDefs, setColDefs] = useState([
        {
            field: "id",
            headerName: "Employee ID"
        },
        {   
            field: "name",
            headerName: "Name"
         },
        {
            field: "email_address",
            headerName: "Email Address"
        },
        { 
            field: "phone_number",
            headerName: "Phone Number"
        },
        {
            field: "days_worked",
            headerName: "Days worked in the cafe"
        },
        {
            field: "cafe_name",
            headerName: "Cafe Name"
        },
        {
            field: "actions",
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

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const showDeleteModal = () => {
        setIsModalDeleteOpen(true);
    };
    const handleDeleteOk = () => {
        deleteEmployeeFunc(selectedEmployee.id)
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
        updateEmployeeFunc(selectedEmployee.id)
        setIsModalEditOpen(false);
    };
    const handleEditCancel = () => {
        setIsModalEditOpen(false);
    };

    async function getData() {
        try {
            const response = await fetch("/employees");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getDataWithCafe(cafe) {
        try {
            const response = await fetch(`/employees?cafes="${cafe}"`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setRowData(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function updateEmployeeFunc(id) {
        const updatedData = form.getFieldsValue();
        const formData = new FormData();
        formData.append('name', `"${updatedData.name}"`);
        formData.append('email', `"${updatedData.email}"`);
        formData.append('phone', `${updatedData.phone}`);
        formData.append('gender', value);
        formData.append('cafe', `"${updatedData.cafe}"`);

        try {
            const response = await fetch(`/employees/"${id}"`, {
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

    async function deleteEmployeeFunc(id) {
        try {
            const response = await fetch(`/employees/"${id}"`, {
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
        getDataWithCafe(e);
    }

    const [form] = Form.useForm();

    function handleEdit(data) {
        setSelectedEmployee(data);
        showEditModal();

        form.setFieldsValue({
            name: data.name,
            email: data.email_address,
            phone: data.phone_number,
            gender: data.gender,
            cafe: data.cafe_name
        })
        setValue(data.gender)
    }

    function handleDelete(data) {
        setSelectedEmployee(data);
        showDeleteModal();
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="Grid-div" style={{width: "96%", height: "75vh"}}>
            <h1>Employee</h1>

            <div className="Grid-header">
                <Link to="./add"><Button type="primary">Add New Employee</Button></Link>

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

            <Form
                form={form}
                name="edit"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                autoComplete="off"
            >
                <Modal
                    title="Edit Employee"
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
                        label="Email Address"
                        name="email"
                        rules={[{ required: true, message: 'Please input a email!' }]}
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[{ required: true, message: 'Please input a phone number!' },
                            { pattern: /^[0-9]{8}$/, message: 'Phone number must be 8 digits!' }
                        ]}
                    >
                    <Input maxLength={8} />
                    </Form.Item>

                    <Form.Item>
                    <Radio.Group
                        onChange={onGenderChange}
                        value={value}
                        options={[
                            {
                            value: 0,
                            className: 'male',
                            label: (
                                <Flex gap="small" justify="center" align="center" vertical>
                                Male
                                </Flex>
                            ),
                            },
                            {
                            value: 1,
                            className: 'female',
                            label: (
                                <Flex gap="small" justify="center" align="center" vertical>
                                Female
                                </Flex>
                            ),
                            },
                        ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Cafe Name"
                        name="cafe"
                        rules={[{ required: true, message: 'Please input a cafe!' }]}
                    >
                    <Input />
                    </Form.Item>
                </Modal>
            </Form>

            <Modal
                title="Delete Employee"
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
                <p>Are you sure you want to delete {selectedEmployee.name}?</p>
            </Modal>
        </div>
    );
}

export default Employee;
