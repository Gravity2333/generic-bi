import { IWidgetFormData } from '@bi/common';
import { Card } from 'antd';

interface IAddWidgetCardProps {
  widget: IWidgetFormData;
  style?: React.CSSProperties;
}

const AddWidgetCard = ({ widget, style }: IAddWidgetCardProps) => {
  return (
    <Card key={widget.id} size="small" title={widget.name} style={style}>
      <div>
        <span>数据源: {widget.datasource}</span>
      </div>
      <div>
        <span>图表类型: {widget.viz_type}</span>
      </div>
      <div>
        <span>最后修改于: {widget.updated_at}</span>
      </div>
    </Card>
  );
};

export default AddWidgetCard;
