/**
 * MSCI China Index 计算并分析个股ROIC数据
 * @author: FindFly
 * @since: 2022-06-06
 */

'use strict';

const { readNSaveExcelFile } = require('./utils/ExcelUtils');
const StockUtils = require('./utils/StockUtils');
const ExcelUtils = require('./utils/ExcelUtils');

const init = async () => {

    /*********************
     * 1. 更新股票列表数据
     **********************/

    // // 要处理的文件名称
    // const fileName = '2025-02.xls';

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

    /*********************
     * 2. 导入ROIC数据
     * ********************/
    /**
     * 读取季度报数据
     */
    // const folderPath = './input/roic/';
    // const quarterlyReportDatas = await ExcelUtils.readQuarterlyReport(folderPath);
    // console.log('读取季度报数据完成，数量: ', quarterlyReportDatas.length);
    /**
     * 导入季度报数据到数据库
     */
    // await StockUtils.importQuarterlyReportData(quarterlyReportDatas);
    
    /*********************
     * 3. 分析ROIC数据
     * ********************/
    // await StockUtils.analyzeStockROIC();

    /*********************
     * 4. 导出ROIC数据
     * ********************/
    await ExcelUtils.exportStockROIC({seasonCount: 7, isMSCI: true});

    console.log("执行完成！");

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();