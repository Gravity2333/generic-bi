import { ArrowRightOutlined } from '@ant-design/icons';
import { Col, Form, Popover, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { HexColorPicker } from 'react-colorful';

export default function ({
  range,
  setRange,
}: {
  range: [string, string];
  setRange: (r: [string, string]) => void;
}) {
  return (
    <Form>
      <Row>
        <Col span={10}>
          <FormItem initialValue={'#5B8FF9'} name="rangeFrom">
            <Popover
              content={
                <HexColorPicker
                  color={range[0]}
                  onChange={(e) => {
                    setRange([e, range[1]]);
                  }}
                />
              }
              placement="bottom"
            >
              {
                <div
                  key={range[0]}
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    height: '30px',
                    border: '1px solid black',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: range[0],
                    marginTop: '8px',
                    marginRight: '2px',
                  }}
                />
              }
            </Popover>
          </FormItem>
        </Col>

        <Col span={2} offset={1}>
          <ArrowRightOutlined style={{ fontSize: '20px', lineHeight: '50px' }} />
        </Col>

        <Col span={10}>
          <FormItem initialValue={'#D940E4'} name="rangeTo">
            <Popover
              content={
                <HexColorPicker
                  color={range[1]}
                  onChange={(e) => {
                    setRange([range[0], e]);
                  }}
                />
              }
              placement="bottom"
            >
              {
                <div
                  key={range[1]}
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    height: '30px',
                    border: '1px solid black',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: range[1],
                    marginTop: '8px',
                    marginRight: '2px',
                  }}
                />
              }
            </Popover>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
}
