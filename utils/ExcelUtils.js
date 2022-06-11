// 严格模式
'use strict';

const XLXS = require('xlsx');

const ExcelUtils = {

    /**
     * 异步读取Excel文件, 返回股票列表
     * 
     * @return {Promise}
    */
    readNSaveExcelFile: async (fileName, fileType) => {

        let path = './input/' + fileName

        if (fileType == 1) {
            // 同花顺
            return await ExcelUtils.readNSaveTHSFile(path);
        } else if (fileType == 2) {
            // MSCI
            return await ExcelUtils.readNSaveMSCIFile(path);
        }
    },

    /**
     * 读取同花顺数据文件
     */
    readNSaveTHSFile: async (path) => {
        // 读取Excel文件
        const workbook = XLXS.readFile(path);
        // 获取工作表
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 初始化season, 截取sheetName前7位
        let season = path.substring(8, 15);

        // 初始化stockList
        let stockList = [];
        let row = 2;
        do {
            // 获取单元格数据
            let stockCode = sheet['A' + row].v.substring(0, 6);
            stockList.push(stockCode);
            row++;
        } while (sheet['A' + row] && sheet['A' + row].v);

        return {
            stockList: stockList,
            season: season
        };
    },

    /**
     * 读取MSCI数据文件
     * @param {String} path 文件路径
     * @returns 
     */
    readNSaveMSCIFile: async (path) => {
        // 读取MSCI China Index文件
        const workbook = XLXS.readFile(path);

        // 获取MSCI China Index工作表
        const sheet = workbook.Sheets['Sheet1'];

        // 循环获取股票代码
        let stockList = [];
        let row = 5;
        do {
            let stockCode = sheet['D' + row].v;
            stockList.push(stockCode);
        } while (sheet['D' + ++row].v);

        return {
            stockList: stockList,
            season: sheet['A2'].v
        };
    }
}

module.exports = ExcelUtils;