import { EVisualizationType, IWidgetFormData } from '@bi/common';
import { Card, Tag } from 'antd';

interface IAddWidgetCardProps {
  widget: IWidgetFormData;
  style?: React.CSSProperties;
}

const AddWidgetCard = ({ widget, style }: IAddWidgetCardProps) => {
  return (
    <Card
      key={widget.id}
      size="small"
      title={
        <>
          <span style={{lineHeight:'39px'}}>{widget.name}</span>
          {(() => {
            if (widget?.readonly === '1') {
              return <Tag style={{marginLeft:'5px'}} color="gray">内置</Tag>;
            }
            if (widget?.viz_type === EVisualizationType.SQL) {
              return <Tag style={{marginLeft:'5px'}} color="blue">SQL查询</Tag>;
            }
          })()}
        </>
      }
      style={{
        height: '100%',
        ...style,
      }}
      headStyle={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      hoverable
    >
      <div>
        <div>
          数据源:
          <div>{widget.datasource}</div>
        </div>
      </div>
      <div>
        <div>
          图表类型:
          <div>{widget.viz_type}</div>
        </div>
      </div>
      <div>
        <div>
          最后修改于:
          <div>{widget.updated_at}</div>
        </div>
      </div>
    </Card>
  );
};

export default AddWidgetCard;
