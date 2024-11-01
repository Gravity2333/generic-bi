import * as JSZIP from "jszip";

/**
 * 文件压缩
 * @param files 需要压缩合并的文件列表
 * @returns zip 文件流
 */
export const toZip = async (
  files: { fileContent: Buffer; filename: string }[],
  gbk = false
): Promise<Buffer> => {
  var zip = new JSZIP();
  if (gbk) {
    // 添加到 zip 中
    files.map((el) => {
      zip.file(el.filename, el.fileContent, { binary: false });
    });
  } else {
    // 添加到 zip 中
    files.map((el) => {
      zip.file(el.filename, el.fileContent, { binary: true });
    });
  }

  return await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE", // 压缩算法
    compressionOptions: {
      level: 9, // 压缩级别
    },
  });
};
