import { queryDatasourcesColumns } from "@/services/dataset";
import { IClickhouseColumn } from "@bi/common";
import { useEffect, useState } from "react";

export default function useColumns(database: string,tableName: string) {
    const [columns, setColumns] = useState<IClickhouseColumn[]>([]);
    const queryColumns = async () => {
      if (!tableName||!database) return;
      const { success, data } = await queryDatasourcesColumns(
        database,
        tableName,
      );
      if(success){
        setColumns(data)
      }
    };
  
    useEffect(() => {
        queryColumns();
    }, [tableName]);
  
    return [columns, () => queryColumns()] as [IClickhouseColumn[], () => void];
  }