import { useState } from 'react';
import useColumns from '../useColumns';
import useDatabases from '../useDatabases';
import useDatasources from '../useDatasource';

export default function useSource() {
  const [databases] = useDatabases();

  const [selectedDb, setSelectedDb] = useState<string>('');
  const [selectedTableName, setSelectedTableName] = useState<string>('');

  const [datasources] = useDatasources(selectedDb);
  const [columns] = useColumns(selectedDb, selectedTableName);

  return {
    databases,
    datasources,
    selectDB: setSelectedDb,
    selectTb: setSelectedTableName,
    columns,
  };
}
