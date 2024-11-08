import { queryDatabases } from "@/services/database";
import { DataBaseParsedType } from "@bi/common";
import { useEffect, useState } from "react";

export default function useDatabases(){
    const [tableData, setTableData] = useState<DataBaseParsedType[]>([]);
    const fetchDatabases = async () => {
        const { success, data } = await queryDatabases();
        if (success) {
          setTableData(
            data.map((item) => ({
              ...item,
              option: JSON.parse(item.option || '{}'),
            })),
          );
        }
      };
    
      useEffect(() => {
        fetchDatabases();
      }, []);
    
    return [
        tableData,fetchDatabases
    ] as [DataBaseParsedType[],()=>void]
}


