import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import { deleteDeafultDashboard, queryAllDefaultDashboards } from '@/services/dashboard';
import { UploadOutlined } from '@ant-design/icons';
import { EBIVERSION, IDashboardFormData, SYSTEM_DASHBOARD_ID } from '@bi/common';
import { Button, Form, List, Modal, Tag, Upload, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState } from 'react';

const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);

export default function DashboardConfig() {
  const [form] = useForm<any>();
  const handleSubmit = () => {};
  const [defaultDashboard, setDefaltDashboard] = useState<IDashboardFormData[]>([]);
  const [defaultDashboardLoading, setDefaltDashboardLoading] = useState<boolean>(true);

  const fetchDefaultDashboard = async () => {
    setDefaltDashboardLoading(true);
    const { success, data } = await queryAllDefaultDashboards();
    if (success) {
      setDefaltDashboard(data);
    }
    setDefaltDashboardLoading(false);
  };

  return (
    <>
      <Form
        name="bi-config"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 40 }}
      >
        <Form.Item label="系统仪表盘" name="systemDashboard" extra="上传后会覆盖原有系统仪表盘">
          <Upload
            {...{
              name: 'file',
              headers: {
                authorization: 'authorization-text',
              },
              method: 'post',
              action: `${API_PREFIX}/dashboards/system/as-import`,
              showUploadList: false,
              withCredentials: true,
              onChange(info) {
                if (info.file.status !== 'uploading') {
                  message.loading('上传中!');
                }
                if (info.file.status === 'done') {
                  message.destroy();
                  message.success(`上传完成!`);
                  fetchDefaultDashboard();
                } else if (info.file.status === 'error') {
                  message.destroy();
                  message.error(`上传失败!`);
                }
              },
              accept: '.bi',
            }}
          >
            <Button icon={<UploadOutlined />}>
              导入
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="默认仪表盘"
          name="customDashboard"
          extra="默认仪表盘无法编辑，并且支持多个"
        >
          <List
            loading={defaultDashboardLoading}
            size="small"
            footer={
              <Upload
                {...{
                  name: 'file',
                  headers: {
                    ...(biToken ? { Authorization: `Bearer ${biToken}` } : {}),
                  },
                  method: 'post',
                  action: `${API_PREFIX}/dashboards/default/as-import`,
                  showUploadList: false,
                  withCredentials: true,
                  onChange(info) {
                    if (info.file.status !== 'uploading') {
                      message.loading('上传中!');
                    }
                    if (info.file.status === 'done') {
                      message.destroy();
                      message.success(`上传完成!`);
                      fetchDefaultDashboard();
                    } else if (info.file.status === 'error') {
                      message.destroy();
                      message.error(`上传失败!`);
                    }
                  },
                  accept: '.bi',
                }}
              >
                <Button icon={<UploadOutlined />} type="dashed" style={{ width: '100%' }}>
                  上传默认仪表盘
                </Button>
              </Upload>
            }
            bordered
            dataSource={defaultDashboard}
            renderItem={(item: IDashboardFormData) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '确定删除吗？',
                        onOk: async () => {
                          const { success } = await deleteDeafultDashboard(
                            (item as any).fileName || '',
                          );
                          if (success) {
                            message.success('删除成功!');
                            fetchDefaultDashboard();
                          } else {
                            message.error('删除失败!');
                          }
                        },
                      });
                    }}
                    disabled={item.id === SYSTEM_DASHBOARD_ID}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <h4>
                      {item.name}
                      {item.id === SYSTEM_DASHBOARD_ID ? (
                        <Tag style={{ marginLeft: '10px' }}>系统内置</Tag>
                      ) : (
                        <Tag style={{ marginLeft: '10px' }}>{(item as any).fileName}</Tag>
                      )}
                    </h4>
                  }
                  description={
                    <>
                      <span>包含图表:</span>
                      {(item as any)?.widgets?.map((w: any) => {
                        return <Tag key={`${item.id}_${w.id}`}>{w.name}</Tag>;
                      })}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Form.Item>
      </Form>
    </>
  );
}
