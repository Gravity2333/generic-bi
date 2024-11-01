import { SEPARATOR_ID } from "../typings";

/**
 * 从 grid layout 的 ID 中截取 widgetId
 * @param i ID
 * @returns
 */
export const getWidgetIdFromLayoutIndex = (i: string) => {
    return i.split(SEPARATOR_ID)[1];
  };