import { Provide } from "@midwayjs/decorator";

const os = require('os');


@Provide()
export class OsService {
    async queryOsInfo() {
        // 获取CPU信息
        const cpus = os.cpus();

        // 获取总内存
        const totalMemory = os.totalmem();

        // 获取空闲内存
        const freeMemory = os.freemem();

        // 获取操作系统信息
        const osInfo = {
            '操作系统': os.platform(),
            '版本': os.release(),
            '主机名': os.hostname(),
            '架构': os.arch(),
            'CPU核心数': cpus.length,
            '总内存': totalMemory,
            '可用内存': freeMemory
        };

        console.log(osInfo)
        return osInfo
    }
}
