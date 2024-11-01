import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import {
  ChartProperties,
  IReferenceResult,
  IWidget,
  IWidgetFormData,
  IWidgetSpecification,
  parseObjJson,
} from '@bi/common';
import { Modal, Result, Spin, message } from 'antd';
import React, { useEffect, useRef } from 'react';
import { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ConfigPanel from '../components/ConfigPanel';
import WidgetRender from '../components/Renderer';
import styles from './index.less';
import TemplateDrawer from '../components/TemplateDrawer';
import { isDev } from '@/common';

interface Props {
  widgetDetail?: IWidget;
  operateType: 'CREATE' | 'UPDATE';
}

export enum ELoadingStatus {
  FAILED = 0,
  SUCCESS = 1,
  PENDING = 2,
}

interface IWidgetEditorContextType {
  tableColumns: any[];
  setTableColums: React.Dispatch<React.SetStateAction<any[]>>;
}

export const WidgetEditorContext = React.createContext<IWidgetEditorContextType>(
  {} as IWidgetEditorContextType,
);

function WidgetEditor(props: Props) {
  const { widgetDetail = {}, operateType = 'CREATE' } = props;
  const templateRef = useRef<any>({});
  const configPanelRef = useRef<any>({});
  const [loading, setLoading] = useState<ELoadingStatus>(ELoadingStatus.SUCCESS);
  const [widget, setWidget] = useState<IWidgetFormData>();
  const [colNames, setColNames] = useState<string[]>([]);
  const [colIdList, setColIdList] = useState<string[]>([]);
  const [references, setReferences] = useState<IReferenceResult[]>([]);
  const [queriesData, setQueriesData] = useState<any>([]);
  const [sql, setSql] = useState<string>('');
  const [explain, setExplain] = useState<string>('');
  const [id, setId] = useState<string>(uuidv4());
  const [submitFunc, setSubmitFunc] = useState<any>();
  const [widgetId, setWidgetId] = useState<string>();
  const { datasets, dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  // table列
  const [tableColumns, setTableColums] = useState<any[]>([]);

  /** widget样式 */
  const [widgetStyle, setWidgetStyle] = useState<ChartProperties>();

  useEffect(() => {
    // 如果是新建模式，自动打开模版drawer
    if (operateType === 'CREATE') {
      templateRef.current?.open();
    }
  }, []);

  return (
    <WidgetEditorContext.Provider
      value={{
        tableColumns,
        setTableColums,
      }}
    >
      <style>
        {`
            :root{
              --top: ${isDev ? '48px' : '0px'};
            }
          `}
      </style>
      <div className={styles['widget-editor']}>
        <div className={styles['widget-editor__config']}>
          {operateType && (
            <ConfigPanel
              ref={configPanelRef}
              dicts={dicts}
              /** widget变动 */
              onWidgetChange={(
                widget,
                colNames,
                colIdList,
                queriesData,
                sql,
                explain,
                reference,
              ) => {
                setWidget(widget);
                setColNames(colNames);
                setColIdList(colIdList);
                setReferences(reference || []);
                setQueriesData(queriesData);
                setSql(sql);
                setExplain(explain);
                setId(uuidv4());
              }}
              /** 重置widget */
              resetWidget={() => {
                setWidget(undefined);
                setColNames([]);
                setColIdList([]);
                setReferences([]);
                setQueriesData([]);
                setSql('');
                setExplain('');
                setId(uuidv4());
              }}
              /** 图表展示变动 */
              onStyleChange={(chartProperties: ChartProperties) => {
                setWidgetStyle(chartProperties);
                setId(uuidv4());
              }}
              /** 修改specification */
              onSpecificationChange={(specification: any) => {
                setWidget({
                  ...(widget as IWidgetFormData),
                  specification: JSON.stringify({
                    ...parseObjJson<IWidgetSpecification>(widget?.specification || ''),
                    ...specification,
                  }),
                });
              }}
              setSubmitFunc={setSubmitFunc}
              setLoading={setLoading}
              onSubmit={() => {
                templateRef.current?.close();
              }}
              loading={loading}
              schemaDetails={datasets}
              defWidgetDetail={widgetDetail}
              operateType={operateType}
              setWidgetId={setWidgetId}
            />
          )}
        </div>
        <div className={styles['widget-editor__container']}>
          <div className={styles['widget-editor__content']}>
            {loading === ELoadingStatus.PENDING ? (
              <Spin size="large" />
            ) : loading === ELoadingStatus.FAILED ? (
              <Result status="warning" title="查询失败" />
            ) : (
              widget && (
                //@ts-ignore
                <WidgetRender
                  widget={widget}
                  colIdList={colIdList}
                  references={references}
                  widgetStyle={widgetStyle}
                  colNames={colNames}
                  queriesData={queriesData}
                  dicts={dicts}
                  sql={sql}
                  explain={explain}
                  showName={true}
                  submitFunc={submitFunc}
                  key={id}
                  widgetId={widgetId}
                />
              )
            )}
            <TemplateDrawer
              ref={templateRef}
              disabled={widget?.readonly === '1'}
              onClick={(template) => {
                const updateFunc = () => {
                  const updateValues = {
                    ...template,
                    ...(JSON.parse(template.specification) || {}),
                    readonly: '0',
                    template: '0'
                  };
                  delete updateValues.specification;
                  delete updateValues.id;
                  configPanelRef.current?.update(updateValues);
                  message.success('模板已选择！');
                };
                if (configPanelRef.current?.isTouched()) {
                  Modal.confirm({
                    title: '设置模板会覆盖当前配置，是否确定',
                    centered: true,
                    onOk: async () => {
                      updateFunc();
                    },
                  });
                } else {
                  updateFunc();
                }
              }}
            />
          </div>
        </div>
      </div>
    </WidgetEditorContext.Provider>
  );
}

export default WidgetEditor;
