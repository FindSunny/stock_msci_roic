/**
 * MSCI China Index 计算并分析个股ROIC数据
 * @author: FindFly
 * @since: 2022-06-06
 */

'use strict';

const Hapi = require('@hapi/hapi');

const { readNSaveExcelFile } = require('./utils/ExcelUtils');
const StockUtils = require('./utils/StockUtils');
const ExcelUtils = require('./utils/ExcelUtils');

const init = async () => {

    // 要处理的文件名称
    // const fileName = '2024-09-11.xls';

    // /**
    //  * 异步读取Excel文件
    //  */
    // const stockInfos = await readNSaveExcelFile(fileName);

    // if (!stockInfos || stockInfos.length === 0) {
    //     console.log('readNSaveExcelFile is out of control!!!!');
    //     return;
    // }
    // /**
    //  * 将股票列表，插入数据库(已插入)
    //  */
    // await StockUtils.insertStockList(stockInfos);

    /**
     * 计算股票ROIC数据, 报告期数据有更新时，必须执行一次
     */
    // await StockUtils.calculateStockROIC();
    
    /**
     * 分析MSCI股票ROIC数据
     */
    await StockUtils.analyzeStockROIC();

    /**
     * 导出MSCI股票ROIC数据
     */
    // await ExcelUtils.exportStockROIC(stockInfo.season);

    console.log("执行完成！");

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();