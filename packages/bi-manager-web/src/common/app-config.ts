export const isDev = process.env.NODE_ENV === 'development';

export const ENV_PREFIX = isDev ? '/api' : '';

export const API_PREFIX = `${ENV_PREFIX}/bi/web-api/v1`;

/** 产品名称 */
export const PRODUCT_NAME = 'BI 可视化平台';
