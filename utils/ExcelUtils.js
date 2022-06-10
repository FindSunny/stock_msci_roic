// 严格模式
'use strict';

const XLXS = require('xlsx');

const ExcelUtils = {

    /**
     * 异步读取Excel文件, 返回股票列表
     * 
     * @return {Promise}
    */
    readNSaveExcelFile: async () => {

        // 读取MSCI China Index文件
        const workbook = XLXS.readFile('./input/MSCI - 2022-06.xlsx');

        // 获取MSCI China Index工作表
        const sheet = workbook.Sheets['Sheet1'];

        // 循环获取股票代码
        const stockList = [];
        let row = 5;
        do {
            const stockCode = sheet['D' + row].v;
            stockList.push(stockCode);

            console.log('stockCode: ', stockCode);
        } while (sheet['D' + ++row].v);

        return stockList;
    },
}

module.exports = ExcelUtils;