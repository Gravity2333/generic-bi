import { queryBiVersion } from "@/services/global";
import { EBIVERSION } from "@bi/common";
import { useEffect, useState } from "react";

export default function useBiVersion(){
    const [biVersion, setBiVersion] = useState<EBIVERSION>(EBIVERSION.NPMD);
    useEffect(() => {
        (async () => {
          const { success, data } = await queryBiVersion()||{};
          if (success) {
            setBiVersion(data);
          }
        })();
      }, []);

      return biVersion
}