/** 验证邮箱信息 */
const checkMail = (mail: string) => {
  return /^\n?[.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(mail);
};

export const validateMail = (_: any, value: string, callback: any) => {
  if (!value) {
    callback();
  }
  if (!checkMail(value)) {
    callback('邮箱格式错误!');
  }
  callback();
};
