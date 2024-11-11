import { Provide } from "@midwayjs/decorator";
import SystemModel from "../model/system";

const os = require('os');
const { exec } = require('child_process');


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
        return osInfo
    }

    async calculateCPUUsage() {
        return await new Promise(resolve => {
            const cpuInfo1 = os.cpus();

            setInterval(() => {
                const cpuInfo2 = os.cpus();
                const idleDiff = cpuInfo2.map((cpu, index) => cpu.times.idle - cpuInfo1[index].times.idle);
                const totalDiff = cpuInfo2.map((cpu, index) => {
                    const times1 = cpuInfo1[index].times;
                    const times2 = cpuInfo2[index].times;
                    return Object.keys(times1).reduce((total, key) => total + (times2[key] - times1[key]), 0);
                });
                const cpuPercentages = totalDiff.map((total, index) => ((total - idleDiff[index]) / total) * 100);
                resolve((cpuPercentages.reduce((prev, curr) => {
                    return prev + curr
                }, 0) / cpuPercentages.length).toFixed(2))
            }, 1000);
        })
    }

    async caculateMemorateUsage() {
        return await new Promise(resolve => {
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const memoryUsagePercent = (totalMemory - freeMemory) / totalMemory * 100;
            resolve(memoryUsagePercent.toFixed(2))
        })
    }

    async getDiskUsage() {
        return await new Promise(resolve => {
            exec('df -h', (error, stdout, stderr) => {
                if (error) {
                    console.error(`执行的错误: ${error}`);
                    return;
                }
                const lines = stdout.split('\n');
                const usageLines = lines.filter(line => line.trim().startsWith('/dev'));

                const usage = usageLines.reduce((curr, line) => {
                    return curr + parseInt(line.trim().split(/\s+/)[4])
                }, 0);
                resolve((usage / usageLines.length).toFixed(2));
            });
        })
    }

    async runSysInfoTask() {
        setInterval(async () => {
            await SystemModel.create({
                memorate_usage: +(await this.caculateMemorateUsage()),
                cpu_usage: +(await this.calculateCPUUsage()),
                disk_usage: +(await this.getDiskUsage()),
            })
        }, 60000)
    }
}
