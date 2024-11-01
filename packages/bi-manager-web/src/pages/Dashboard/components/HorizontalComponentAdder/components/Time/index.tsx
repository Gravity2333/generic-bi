import moment from 'moment';
import { useEffect, useState } from 'react';

export default function () {
  const [time, setTime] = useState<string>(moment().format('YYYY-MM-DD HH:mm:ss'));
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div style={{ fontSize: '30px' }}>
      <span>{time}</span>
    </div>
  );
}
