import { queryCurrentUserInfo } from "@/services/global";
import { backToLogin } from "@/utils";
import { useEffect } from "react";
import { useModel } from "umi";

export default function useCurrentUserInfo() {
    const { initialState, setInitialState } = useModel('@@initialState');

    async function reload() {
        const { success, data } = await queryCurrentUserInfo();
        if (success) {
            setInitialState(prev => ({
                ...(prev || {}),
                currentUserInfo: data,
            }) as any);
        } else {
            backToLogin();
        }
    }
    useEffect(() => {
        reload()
    },[])

    return [initialState, reload] as [any, () => void]
}