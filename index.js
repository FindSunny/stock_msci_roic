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

    /**
     * 异步读取Excel文件
     */
    const stockList = await readNSaveExcelFile();

    if (!stockList || stockList.length === 0) {
        console.log('readNSaveExcelFile is out of control!!!!');
        return;
    }

    /**
     * 将股票列表，插入数据库
     */
    await StockUtils.insertStockList(stockList);

    /**
     * 批量获取MSCI股票数据，
     */
    // await StockUtils.fetchStockData();

    /**
     * 计算MSCI股票ROIC数据
     */
    // await StockUtils.calculateStockROIC();

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