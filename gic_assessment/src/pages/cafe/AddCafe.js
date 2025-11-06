import { Button, Form, Input } from 'antd';
import "../index.css";

function AddCafe() {
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
        formData.append('description', `"${values.description}"`);
        if (values.logo == undefined) {
            formData.append('logo', `""`);
        } else {
            formData.append('logo', `"${values.logo}"`);
        }
        formData.append('location', `"${values.location}"`);

        try {
            const response = await fetch("/cafes", {
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
            <h1>Add Cafe</h1>

            <Form
                name="add"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
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

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default AddCafe;
