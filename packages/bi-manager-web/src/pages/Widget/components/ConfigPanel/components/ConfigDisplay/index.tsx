import { Form } from 'antd';
import { EVisualizationType } from '@bi/common';
import { useContext, useEffect, useRef } from 'react';
import { ConfigPanelContext } from '../..';
import TimeSeriesConfig from './components/TimeSeriesConfig';
import PieConfig from './components/PieConfig';
import BarColumnConfig from './components/BarColumnConfig';
import BigNumberConfig from './components/BigNumberConfig';
import TableConfig from './components/TableConfig';
import React from 'react';
import TimeColumnConfig from './components/TimeColumnConfig';

export interface IMenuType {
  id: string;
  name: string;
  type: string;
  data: string;
}

export const ConfigDisplayContext = React.createContext<{
  forceRefresh: () => void;
}>({} as any);

export default function ConfigDisplay({ defaultValues }: { defaultValues: any }) {
  /** 表单 */
  const [form] = Form.useForm();
  const displayRef = useRef<{ submit: any }>(null);
  const { viz_type: type, changeStyles } = useContext(ConfigPanelContext);

  useEffect(() => {
    (async () => {
      setTimeout(async() => {
        changeStyles(await displayRef?.current?.submit()); 
      });
    })();
  }, []);

  return (
    <ConfigDisplayContext.Provider
      value={{
        forceRefresh: async () => {
          changeStyles(await displayRef?.current?.submit());
        },
      }}
    >
      <Form
        layout="vertical"
        name="display"
        form={form}
        onFieldsChange={async (e) => {
          if (e.length !== 0) {
            setTimeout(async () => {
              changeStyles(await displayRef?.current?.submit());
            });
          }
        }}
      >
        {(() => {
          switch (type) {
            case EVisualizationType.TimeHistogram:
              return (
                <TimeSeriesConfig form={form} defaultValues={defaultValues} ref={displayRef} />
              );
            case EVisualizationType.Pie:
              return <PieConfig form={form} defaultValues={defaultValues} ref={displayRef} />;
            case EVisualizationType.Column:
              return (
                <BarColumnConfig
                  type={EVisualizationType.Column}
                  form={form}
                  defaultValues={defaultValues}
                  ref={displayRef}
                />
              );
            case EVisualizationType.Bar:
              return (
                <BarColumnConfig
                  type={EVisualizationType.Bar}
                  form={form}
                  defaultValues={defaultValues}
                  ref={displayRef}
                />
              );
            case EVisualizationType.Time_Column:
              return (
                <TimeColumnConfig form={form} defaultValues={defaultValues} ref={displayRef} />
              );
            case EVisualizationType.BigNumberTotal:
              return <BigNumberConfig form={form} defaultValues={defaultValues} ref={displayRef} />;
            case EVisualizationType.Table:
              return <TableConfig form={form} defaultValues={defaultValues} ref={displayRef} />;
          }
        })()}
      </Form>
    </ConfigDisplayContext.Provider>
  );
}
