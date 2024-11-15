declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare module '*.webp'
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

interface Window {
  // 定义config配置文件
  productInfo: {
    projectInfo: {
      show: boolean,
      title: string,
      mode: string,
      description: string[],
      showAuthor: boolean,
      showSource: boolean,
    },
    loginTitle: string,
  }
}