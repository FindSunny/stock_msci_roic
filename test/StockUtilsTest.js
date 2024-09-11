/**
 * stockUtilsTest.js
 */

const StockUtils = require('../utils/StockUtils');
const HttpUtils = require('../utils/HttpUtils');

const getProfitDataTest = async () => {
    const stockCode = '600519';
    const sdate = '2023-03-31';
    const edate = '2024-03-31';
    const data = await HttpUtils.getProfitData(stockCode, sdate, edate);
    console.log(data);

    // 2024-09-11
    // 经验证巨潮接口无法使用，需要找其他接口
}

(async () => {
    await getProfitDataTest();
})();