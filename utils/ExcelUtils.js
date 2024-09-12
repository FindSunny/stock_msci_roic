// 严格模式
'use strict';

const XLXS = require('xlsx');
const SQLUtils = require('./SQLUtils.js');

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
            let industry = sheet['G' + row].v;
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
    exportStockROIC: async () => {

        console.log('导出MSCI China Index股票ROIC数据中...');
        // 查询全部数据
        let queryStock = `SELECT * FROM stock WHERE var_roic != 0 AND report_count >= 15;`
        const stocks = await SQLUtils.execute(queryStock);
        if (stocks.length == 0) {
            console.log(new Date().toLocaleString(), "无股票数据");
            return;
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
        let fileName = 'China Index ROIC ' + '_' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + 'byQ.xlsx';
        XLXS.writeFile(workbook, './output/' + fileName);

        console.log('China Index ROIC数据导出成功！');

    }

}

module.exports = ExcelUtils;