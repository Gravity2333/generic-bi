import { createDashboard, queryDashboards, updateDashboard } from '@/services/dashboard';
import { IDashboardFormData } from '@bi/common';
import { Button, Form, Input, Menu, message, Modal, Popover, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'umi';
import { EWidgetActionKey } from '../..';
import { v4 as uuidv4 } from 'uuid';
import { history } from 'umi';
import { SEPARATOR_ID } from '@/components/GridLayout/typings';
import { CopyOutlined } from '@ant-design/icons';

const FormItem = Form.Item;
const Option = Select;

interface IAddToDashboardProps {
  /** 提交函数 */
  submitFunc?: () => any;
  createId?: string;
  /** 是否需要检查保存 */
  isCheckSaved?: boolean;
  id?: string;
  /** 模式 */
  mode?: 'menu' | 'button';
  /** title */
  title?: string;
  icon?: any;
  /** 成功添加回调 */
  onSuccess?: (selectedDashboards: string[], newDashboard: boolean) => void;
  btnType?: "text" | "link" | "default" | "ghost" | "primary" | "dashed";
}

function AddToDashboard({
  submitFunc,
  createId,
  mode = 'menu',
  isCheckSaved = true,
  id,
  title,
  icon,
  onSuccess,
  btnType='link'
}: IAddToDashboardProps) {
  const [showAddDashboard, setShowAddDashboard] = useState<boolean>(false);
  const [dashboards, setDashboards] = useState<IDashboardFormData[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const { widgetId } = useParams<{ widgetId: string }>();
  const [createDashboardName, setCreateDashboardName] = useState<string>('');

  const addToDashboard = async (widgetId: string) => {
    let allSuccess = true;
    /** 处理现有仪表盘 */
    selectedDashboards.map(async (dashboardId) => {
      const { name, specification, widget_ids, readonly } =
        dashboards.find((dashboard) => dashboard.id === dashboardId) || {};
      const { layouts, time_range } = JSON.parse(specification || '');

      const data = {
        id: dashboardId,
        name: name || '',
        widget_ids: [...(widget_ids || []), widgetId],
        readonly: readonly!,
        specification: JSON.stringify({
          layouts: [
            ...(layouts || []),
            {
              h: 3,
              i: `${uuidv4()}${SEPARATOR_ID}${widgetId}`,
              isDraggable: true,
              moved: false,
              static: false,
              w: 3,
              x: 0,
              y: 0,
            },
          ],
          time_range,
        })!,
      };
      const { success } = await updateDashboard(data);
      allSuccess = allSuccess && success;
    });
    if (createDashboardName) {
      /** 处理新增仪表盘 */
      const data = {
        name: createDashboardName,
        widget_ids: [widgetId],
        readonly: '0',
        specification: JSON.stringify({
          layouts: [
            {
              h: 3,
              i: `${uuidv4()}${SEPARATOR_ID}${widgetId}`,
              isDraggable: true,
              moved: false,
              static: false,
              w: 3,
              x: 0,
              y: 0,
            },
          ],
        }),
      };
      const { success } = await createDashboard(data);
      allSuccess = allSuccess && success;
    }

    if (allSuccess) {
      message.success('添加成功!');
      if (onSuccess) {
        onSuccess(selectedDashboards, !!createDashboardName);
      }
    } else {
      message.error('添加失败!');
    }
    if (createId) {
      history.push(`/widget/${createId}/update`);
    }
    setSelectedDashboards([]);
  };

  const checkSaved = () => {
    Modal.confirm({
      title: '是否确定保存此图表',
      onOk: async () => {
        if (submitFunc) {
          submitFunc();
          if (widgetId) {
            addToDashboard(widgetId);
          }
        }
      },
    });
    return;
  };

  useEffect(() => {
    if (createId && (selectedDashboards.length > 0 || createDashboardName !== '')) {
      addToDashboard(createId);
    }
  }, [createId, selectedDashboards]);

  return (
    <>
      {mode === 'menu' ? (
        <Menu.Item
          key={EWidgetActionKey.AddToDashboard}
          icon={icon}
          onClick={async () => {
            const { success, data } = await queryDashboards({});
            if (!success) {
              message.error('未查询到仪表盘!');
              return;
            }
            setDashboards(data?.rows);
            setSelectedDashboards([]);
            setShowAddDashboard(true);
          }}
        >
          {title}
        </Menu.Item>
      ) : (
        <Popover content={'添加到仪表盘'} title={undefined} trigger="hover">
          <Button
            icon={<CopyOutlined />}
            type={btnType}
            onClick={async () => {
              const { success, data } = await queryDashboards({});
              if (!success) {
                message.error('未查询到仪表盘!');
                return;
              }
              setDashboards(data?.rows);
              setSelectedDashboards([]);
              setShowAddDashboard(true);
            }}
          >
            {title}
          </Button>
        </Popover>
      )}

      <Modal
        destroyOnClose
        width="600px"
        visible={showAddDashboard}
        title={title}
        bodyStyle={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
        closable={false}
        footer={
          <>
            <Button
              onClick={() => {
                setSelectedDashboards([]);
                setShowAddDashboard(false);
              }}
            >
              关闭
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (!isCheckSaved && id) {
                  addToDashboard(id || '');
                } else {
                  checkSaved();
                }

                setShowAddDashboard(false);
              }}
              disabled={selectedDashboards?.length <= 0 && createDashboardName === ''}
            >
              添加
            </Button>
          </>
        }
      >
        <Form layout="vertical">
          <FormItem name="description" label="现有仪表盘:">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              value={selectedDashboards}
              onChange={(e) => {
                setSelectedDashboards(e);
              }}
              placeholder="请选择仪表盘"
            >
              {dashboards &&
                dashboards
                  .filter(({ readonly }) => readonly !== '1')
                  .map((dashboard) => {
                    const { id, name } = dashboard;
                    return (
                      <Option key={id} value={id}>
                        {name}
                      </Option>
                    );
                  })}
            </Select>
          </FormItem>
          <FormItem label="新建仪表盘:">
            <Input
              placeholder="请输入仪表盘名称"
              value={createDashboardName}
              onChange={(e) => setCreateDashboardName(e.target.value)}
            ></Input>
          </FormItem>
        </Form>
      </Modal>
    </>
  );
}

export default AddToDashboard;
