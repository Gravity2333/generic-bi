export const DROPPING_ELEM_ID = '__dropping-elem__';
export const SEPARATOR_ID = '$__$';

export interface IGridLayoutItem extends ReactGridLayout.Layout {}
export interface IGridLayoutProps {
  /** 只读预览状态 */
  readonly?: boolean;
  /** 初始化layouts */
  initLayouts: IGridLayoutItem[];
  /** gridlayout信息 */
  layoutInfoFuncRef?: any;
  /** 文字信息 */
  texts: Map<string, any>;
  onLayoutChange?: (layouts: IGridLayoutItem[])=>void;
}