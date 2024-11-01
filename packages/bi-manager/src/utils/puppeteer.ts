import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as puppeteer from "puppeteer";
import { IReportJobFile } from "../interface";

export async function autoScroll(page: puppeteer.Page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var height_px = document
        ?.getElementsByClassName("react-grid-layout")[0]
        .getBoundingClientRect().bottom;
      var timer = setInterval(() => {
        var scrollHeight = height_px;

        // select the scrollable view
        // in newer version of grafana the scrollable div is 'scrollbar-view'
        var scrollableEl = document.getElementsByTagName("body")[0];
        // element.scrollBy(0, distance);
        scrollableEl.scrollBy({
          top: distance,
          left: 0,
          behavior: "smooth",
        });

        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 300);
    });
  });
}

// 参考
// https://gist.github.com/svet-b/1ad0656cd3ce0e1a633e16eb20f66425

// 优化puppeteer
// https://mrseawave.github.io/blogs/articles/2021/07/05/optimize-puppeteer/

// Set the browser width in pixels. The paper size will be calculated on the basus of 96dpi,
// so 1200 corresponds to 12.5".
const width_px = 1200;

/**
 * Puppeteer 网页生成 PDF 文件
 */
export async function html2pdf(
  {
    pages,
    auth_header,
  }: {
    pages: {
      /** 网页地址 */
      url: string;
      /**
       * 保存文件的名称
       * @eg test.pdf
       */
      filename: string;
      /**
       * 保存文件的路径，不填写时将不保存在本地
       * @eg /a/b/c
       */
      fileDirectory?: string;
    }[];
    /** 存储位置 */
    path?: string;
    /** basic auth headers */
    auth_header?: string;
  },
  shutScreen = false
) {
  const result: IReportJobFile[] = [];
  const pngList: any[] = [];
  // 生成
  const browser = await puppeteer.launch({
    headless: true, // 以 无头模式（隐藏浏览器界面）运行浏览器
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/usr/bin/chromium-browser"
        : undefined,
    args: [
      "--disable-gpu", // GPU硬件加速
      "--disable-dev-shm-usage", // 创建临时文件共享内存
      "--disable-setuid-sandbox", // uid沙盒
      "--no-first-run", // 没有设置首页。在启动的时候，就会打开一个空白页面。
      "--no-sandbox", // 沙盒模式
      "--no-zygote",
      "--single-process", // 单进程运行
    ],
  });

  // 遍历所有的网页
  for (let page of pages) {
    // 检查文件夹是否存在，不存在则创建
    if (page.fileDirectory && !fs.existsSync(page.fileDirectory)) {
      mkdirp.sync(page.fileDirectory);
    }

    const browserPage = await browser.newPage();
    // Set basic auth headers
    if (auth_header) {
      await browserPage.setExtraHTTPHeaders({ Authorization: auth_header });
    }

    try {
      // Increase timeout from the default of 30 seconds to 120 seconds, to allow for slow-loading panels
      browserPage.setDefaultNavigationTimeout(120 * 1000);

      // Increasing the deviceScaleFactor gets a higher-resolution image. The width should be set to
      // the same value as in page.pdf() below. The height is not important
      await browserPage.setViewport({
        width: width_px,
        height: 800,
        deviceScaleFactor: 2,
        isMobile: false,
      });

      await browserPage.goto(page.url, {
        // 不再有网络连接时触发（至少500毫秒后）
        // networkidle0
        // 直到页面加载后同时没有存在 2 个以上的资源请求，这个种状态持续至少 500 ms
        waitUntil: "networkidle2",
      });

      // 等待所有的 loading 消失
      await browserPage.waitForSelector(".widget-loading", {
        hidden: true,
        timeout: 30 * 1000,
      });

      // Get the height of the main canvas, and add a margin
      var height_px =
        (await browserPage.evaluate(() => {
          return (
            document
              .querySelector(".react-grid-layout")
              ?.getBoundingClientRect().bottom || document.body.clientHeight
          );
        })) + 20;

      // await autoScroll(page);
      const filePath = page.fileDirectory
        ? path.join(page.fileDirectory, page.filename)
        : undefined;

      if (shutScreen) {
        pngList.push({
          fileName: page.filename?.split(".")[0] + ".png",
          filePath: filePath,
          fileContent: await browserPage.screenshot({
            path: filePath,
            type: "png",
            fullPage: true,
          }),
        });
      }

      const pdf = await browserPage.pdf({
        path: filePath,
        width: width_px + "px",
        height: height_px + "px",
        scale: 1,
        // format: "a4",
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });

      result.push({
        fileContent: pdf,
        filePath,
        filename: page.filename,
      });
    } catch (error) {
      throw new Error("[Puppeteer] generate pdf error: " + error);
    } finally {
      // 关闭页面
      await browserPage.close();
    }
  }

  // 关闭浏览器
  await browser.close();
  return [result, pngList] as [
    IReportJobFile[],
    { fileName: string; fileContent: Buffer }[]
  ];
}
