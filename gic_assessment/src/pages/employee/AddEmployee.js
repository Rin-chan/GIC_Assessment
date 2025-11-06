import React, { useState } from 'react';
import { Button, Form, Input, DatePicker, Radio, Flex } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from "react-router";
import "../index.css";

function AddEmployee() {
    const navigate = useNavigate();

    const [value, setValue] = useState(0);
    const onChange = e => {
        setValue(e.target.value);
    };

    const dateFormat = 'YYYY/MM/DD';

    const onFinish = values => {
        console.log('Success:', values);
        postData(values);
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    async function postData(values) {
        const formData = new FormData();
        formData.append('name', `"${values.name}"`);
        formData.append('email', `"${values.email}"`);
        formData.append('phone', `${values.phone}`);
        formData.append('gender', value);
        formData.append('start_date', values.start_date.format(dateFormat));
        formData.append('cafe', `"${values.cafe}"`);

        try {
            const response = await fetch("/employees", {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="Grid-div" style={{width: "96%", height: "75vh"}}>
            <h1>Add Employee</h1>

            <Form
                name="add"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{
                    start_date: dayjs()
                }}
                autoComplete="off"
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input a name!' }]}
                >
                <Input minLength={6} maxLength={10}/>
                </Form.Item>

                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[{ required: true, message: 'Please input a email address!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[{ required: true, message: 'Please input a phone number!' },
                        { pattern: /^[8-9]{1}[0-9]{7}$/, message: 'Phone number must be 8 digits!' }
                    ]}
                >
                <Input maxLength={8} />
                </Form.Item>

                <Form.Item>
                <Radio.Group
                    onChange={onChange}
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
                    label="Start Date"
                    name="start_date"
                >
                <DatePicker defaultValue={dayjs()} format={dateFormat} />
                </Form.Item>

                <Form.Item
                    label="Cafe Name"
                    name="cafe"
                    rules={[{ required: true, message: 'Please input a cafe!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]}
                >
                <Input />
                </Form.Item>

                <div className="Form-Buttons">
                    <Form.Item label={null}>
                        <Button onClick={() => navigate("/employees")}>
                            Cancel
                        </Button>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </div>
    );
}

export default AddEmployee;
