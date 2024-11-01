import { message } from 'antd';
import domToImage, { Options } from 'dom-to-image';
import kebabCase from 'lodash/kebabCase';

/**
 * @remark
 * same as https://github.com/apache/superset/blob/c53bc4ddf9808a8bb6916bbe3cb31935d33a2420/superset-frontend/src/assets/stylesheets/less/variables.less#L34
 */
const GRAY_BACKGROUND_COLOR = '#F5F5F5';

/**
 * generate a consistent file stem from a description and date
 *
 * @param description title or description of content of file
 * @param date date when file was generated
 */
const generateFileStem = (description: string, date = new Date()) =>
  `${kebabCase(description)}-${date.toISOString().replace(/[: ]/g, '-')}`;

/**
 * 将 HTML DOM 转换为图片
 *
 * @param selector css selector of the parent element which should be turned into image
 * @param description name or a short description of what is being printed.
 *   Value will be normalized, and a date as well as a file extension will be added.
 * @param domToImageOptions dom-to-image Options object.
 * @returns event handler
 */
export default function downloadAsImage(
  selector: string,
  description: string,
  domToImageOptions: Options = {},
) {
  const elementToPrint = document.querySelector(selector);

  if (!elementToPrint) {
    return message.warning('图片下载失败，请刷新页面后再次尝试。');
  }

  // Mapbox controls are loaded from different origin, causing CORS error
  // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#exceptions
  const filter = (node: Element) => {
    if (typeof node.className === 'string') {
      return !node.className.includes('ant-dropdown');
    }
    return true;
  };

  return domToImage
    .toPng(elementToPrint, {
      quality: 0.95,
      bgcolor: GRAY_BACKGROUND_COLOR,
      // @ts-ignore
      filter,
    })
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `${generateFileStem(description)}.png`;
      link.href = dataUrl;
      link.click();
    })
    .catch((e) => {
    });
}
