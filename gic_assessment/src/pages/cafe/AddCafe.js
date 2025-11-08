import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex, message, Upload } from 'antd';
import { useNavigate } from "react-router";
import "../index.css";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

function AddCafe() {
    const navigate = useNavigate();

    const onFinish = values => {
        postData(values);
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    async function postData(values) {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        if (imageUrl == undefined) {
            formData.append('logo', "");
        } else {
            formData.append('logo', imageUrl);
        }
        formData.append('location', values.location);

        try {
            const response = await fetch("/cafes", {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            navigate("/cafes");
        } catch (error) {
            console.error(error.message);
        }
    }

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState();
    const handleChange = info => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, url => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

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
                <Input minLength={6} maxLength={10} />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please input a description!' }]}
                >
                <Input maxLength={256} />
                </Form.Item>

                <Form.Item
                    label="Logo"
                    name="logo"
                >
                <Flex gap="middle" wrap>
                    <Upload
                        name="file"
                        listType="picture-circle"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        customRequest={({ file, onSuccess }) => {
                            onSuccess('ok');
                        }}
                    >
                        {imageUrl ? (
                        <img draggable={false} src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                        ) : (
                        uploadButton
                        )}
                    </Upload>
                </Flex>
                </Form.Item>

                <Form.Item
                    label="Location"
                    name="location"
                    rules={[{ required: true, message: 'Please input a location!' }]}
                >
                <Input />
                </Form.Item>

                <div className="Form-Buttons">
                    <Form.Item label={null}>
                        <Button onClick={() => navigate("/cafes")}>
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

export default AddCafe;
