/**
 * MSCI China Index 计算并分析个股ROIC数据
 * @author: FindFly
 * @since: 2022-06-06
 */

'use strict';

const Hapi = require('@hapi/hapi');

const { readNSaveExcelFile } = require('./utils/ExcelUtils');
const StockUtils = require('./utils/StockUtils');

const init = async () => {

    // 要处理的文件名称
    const fileName = '2022-06-11.xls';
    // 文件类型， 1：同花顺， 2：MSCI官网
    const fileType = 1;

    /**
     * 异步读取Excel文件
     */
    const stockInfo = await readNSaveExcelFile(fileName, fileType);

    if (!stockInfo.stockList || stockInfo.stockList.length === 0) {
        console.log('readNSaveExcelFile is out of control!!!!');
        return;
    }

    /**
     * 将股票列表，插入数据库
     */
    await StockUtils.insertStockList(stockInfo.stockList, stockInfo.season);

    /**
     * 批量获取MSCI股票数据
     */
    await StockUtils.fetchStockData(stockInfo.stockList);

    /**
     * 计算MSCI股票ROIC数据
     */
    await StockUtils.calculateStockROIC(stockInfo.stockList, stockInfo.season);

    /**
     * 导出MSCI股票ROIC数据
     */
    // await ExcelUtils.exportStockROIC();

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();