// 严格模式
'use strict';

const fs = require('fs');
const path = require('path');
const XLXS = require('xlsx');
const SQLUtils = require('./SQLUtils.js');
const allMSCIStockCodes = require('../input/all_MSCI_stocks.json');

const ExcelUtils = {

    /**
     * 异步读取Excel文件, 返回股票列表
     * 
     * @return {Promise}
    */
    readNSaveExcelFile: async (fileName) => {

        let path = './input/' + fileName

        // 同花顺
        return await ExcelUtils.readNSaveTHSFile(path);
    },

    /**
     * 读取同花顺数据文件
     */
    readNSaveTHSFile: async (path) => {
        // 读取Excel文件
        const workbook = XLXS.readFile(path);
        // 获取工作表
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 初始化stockList
        let stockList = [];
        let row = 2;
        do {
            // 获取单元格数据
            let stockCode = sheet['A' + row].v.substring(0, 6);
            let stockName = sheet['B' + row].v;
            let industry = sheet['N' + row].v;
            stockList.push({
                code: stockCode,
                name: stockName,
                industry: industry
            });
            row++;
        } while (sheet['A' + row] && sheet['A' + row].v);

        return stockList;
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
    },

    /**
     * 导出MSCI China Index股票ROIC数据
     * @returns
     */
    exportStockROIC: async ({seasonCount, isMSCI}) => {
        seasonCount = seasonCount || 12;
        console.log('导出MSCI China Index股票ROIC数据中...');
        // 查询全部数据
        let queryStock = `SELECT * FROM stock WHERE var_roic != 0 AND report_count >= ${seasonCount};`
        let stocks = await SQLUtils.execute(queryStock);
        if (stocks.length == 0) {
            console.log(new Date().toLocaleString(), "无股票数据");
            return;
        }
        // 过滤MSCI成分股
        if (isMSCI) {
            console.log('仅导出MSCI成分股数据...');
            stocks = stocks.filter(stock => allMSCIStockCodes.findIndex(item => item.code === stock.stock_code) !== -1);

            // 按照中位数降序排序，取前一半
            stocks.sort((a, b) => b.median_roic - a.median_roic);
            const halfLength = Math.ceil(stocks.length / 2);
            stocks = stocks.slice(0, halfLength);

            // 按照方差升序排序，取前50%
            stocks.sort((a, b) => a.var_roic - b.var_roic);
            const quarterLength = Math.ceil(stocks.length / 2);
            stocks = stocks.slice(0, quarterLength);

        }
        // 新建Excel文件
        let workbook = XLXS.utils.book_new();
        // 写入工作表
        let ws_data = [];
        ws_data.push(['证券简称', '证券代码', 'ROIC中位数', 'ROIC方差', '行业']);
        stocks.forEach(result => {
            ws_data.push([result.stock_name, result.stock_code, result.median_roic, result.var_roic, result.industry]);
        });
        let ws = XLXS.utils.aoa_to_sheet(ws_data);
        // 创建工作簿
        XLXS.utils.book_append_sheet(workbook, ws, 'China Index ROIC');

        // 导出Excel文件
        let fileName = 'China Index ROIC ' + '_连续' + seasonCount + '季度_' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + (new Date().getTime()) + '_byQ.xlsx';
        XLXS.writeFile(workbook, './output/' + fileName);

        console.log('China Index ROIC数据导出成功！');

    },

    /**
     * 工具 - 读取季度报数据
     */
    readQuarterlyReport: async (folderPath) => {

        // 读取文件列表
        const files = fs.readdirSync(folderPath);
        if (files.length === 0) {
            console.log('季度报数据文件夹为空，无法读取数据');
            return [];
        }
        console.log('季度报数据文件夹，文件数量: ', files.length);

        let quarterlyReportDatas = [];
        // 循环读取文件
        for (let index = 0; index < files.length; index++) {
            const fileName = files[index];
            // 若文件名称包含[OK],则跳过
            if (fileName.includes('OK')) {
                console.log('跳过已处理文件: ', fileName);
                continue;
            }
            console.log('读取季度报数据: ', fileName);
            const filePath = path.join(folderPath, fileName);
            // 读取Excel文件
            const workbook = XLXS.readFile(filePath);
            // 获取工作表
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // 读取数据行
            let row = 2;
            const reportDate = fileName.replace('.xlsx', '').replace('.xls', '');
            do {
                const to2 = (v) => {
                    const n = Number(v);
                    return isNaN(n) ? 0 : Number(n.toFixed(2));
                };

                let stock = {
                    stock_code: sheet['A' + row].v.substring(0, 6),
                    stock_name: sheet['B' + row].v,
                    report_date: reportDate,
                    net_profit: sheet['C' + row].v ? to2(sheet['C' + row].v / 100000000) : 0,
                    end_total_invested_capital: sheet['D' + row].v ? to2(sheet['D' + row].v / 100000000) : 0,
                    roic: sheet['E' + row].v ? to2(sheet['E' + row].v) : 0
                };
                quarterlyReportDatas.push(stock);
                row++;
            } while (sheet['A' + row] && sheet['A' + row].v);

            console.log(`读取文件 ${fileName} 完成，数据量: `, row - 2);
        }

        return quarterlyReportDatas;

    }

}

module.exports = ExcelUtils;