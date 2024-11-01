const crypto = require("crypto");

const encrypt_passeord = "yRKcxHQYeMJFdyHHB@pCJtDPjXjsys-D";

// 加密函数
const encrypt = ((password: string, text: string) => {
  const iv = crypto.randomBytes(16); // 初始化向量
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(password).digest(),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}).bind(null, encrypt_passeord);

// 解密函数
const decrypt = ((password: string, text: string) => {
  let infos = "";
  try {
    infos = JSON.parse(text);
  } catch (e) {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(password).digest(),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    infos = JSON.parse(decrypted.toString());
  }

  return infos;
}).bind(null, encrypt_passeord);

export { encrypt, decrypt };
