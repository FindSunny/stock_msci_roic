// 严格模式
'use strict';

const SQLUtils = require('./SQLUtils.js');
const HttpUtils = require('./HttpUtils.js');

const StockUtils = {

    /**
     * 批量插入股票代码列表
     * @param {*} stockList 股票代码列表 
     * @returns 
     */

    insertStockList: async (stockList) => {

        // 整理股票代码列表
        const stockCodeList = [];
        for (let index = 0; index < stockList.length; index++) {
            const stockInfo = stockList[index];

            // 查看数据库有无数据
            const querySql = 'SELECT * FROM stock where stock_code = ?';
            const queryResult = await SQLUtils.execute(querySql, [stockInfo.code]);
            if (queryResult.length > 0) {
                console.log('数据库已有数据，不需要插入数据');
                return;
            }
            stockCodeList.push({
                stock_code: stockInfo.code,
                stock_name: stockInfo.name,
                industry: stockInfo.industry
            });
        }
        const sql = `INSERT INTO stock (stock_code, stock_name, industry) VALUES ?`;
        const params = [];
        for (let index = 0; index < stockCodeList.length; index++) {
            const stock = stockCodeList[index];
            params.push([stock.stock_code, stock.stock_name, stock.industry]);
        }
        // 执行sql语句
        const result = await SQLUtils.execute(sql, [params]);
        // 打印日志
        console.log('股票信息表，数据已插入: ', result.affectedRows, '条数据');
        return result;

    },

    /**
     * 计算MSCI股票ROIC数据
     */
    calculateStockROIC: async () => {

        // 查询全部数据
        let queryStock = `SELECT * FROM stock;`
        const stocks = await SQLUtils.execute(queryStock);
        if (stocks.length == 0) {
            console.log("无股票数据");
            return;
        }

        for (let index = 0; index < stocks.length; index++) {
            const stockInfo = stocks[index];
            const stockCode = stockInfo.stock_code;
            // 查询roic数据表
            let querySql = `SELECT * FROM roic_calculation WHERE stock_code = ? ORDER BY report_date DESC;`;
            let roics = await SQLUtils.execute(querySql, [stockCode]);
            if (roics.length == 0 || roics.length == 1) {
                console.log(`无${stockCode}的ROIC数据`);
                continue;
            }
            // 更新净利润及资产等数据，最后一条数据为初始化数据，不需要更新
            for (let i = 0; i < roics.length - 1; i++) {
                // 当前年份
                let currentYear = roics[i].report_date.substring(0, 4);
                // 当前季度
                let currentQuarter = roics[i].report_date.substring(5, 6);
                // 若当前季度是第一季度，则上季度为去年第四季度
                let lastQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;

                // 仅年度出现变化时，更新当期净利润
                let currentProfit = roics[i].net_profit;
                if (lastQuarter != 4) {
                    // 赋值当期净利润 = 本报告期净利润 - 上季度净利润
                    currentProfit = currentProfit - roics[i + 1].net_profit;
                }
                // 期初全部投入资本 = 上季度全部投入资本
                let initialCapital = roics[i + 1].end_total_invested_capital;
            
                // 计算ROIC = 本期净利润 * 2 / (期初全部投入资本 + 本期全部投入资本)
                let roic = (currentProfit * 2) / (initialCapital + roics[i].end_total_invested_capital);
                // 保留两位小数
                roic = Math.round(roic * 10000) / 100;

                // 更新ROIC数据
                let updateSql = `UPDATE roic_calculation SET roic = ?, current_net_profit = ?, start_total_invested_capital = ? WHERE stock_code = ? AND report_date = ?;`;
                await SQLUtils.execute(updateSql, [roic, currentProfit, initialCapital, stockCode, roics[i].report_date]);
                console.log(new Date().toLocaleString(), `已成功更新${stockCode}-${stockInfo.stock_name} ${roics[i].report_date}的 ${roics[i].report_date} ROIC数据: ${roic}`);
            }

        }
        console.log(new Date().toLocaleString(), '所有股票ROIC数据已更新完毕');
    },

    /**
     * 分析MSCI股票ROIC数据
     * @returns 
     */
    analyzeStockROIC: async () => {

        // 查询全部数据
        let queryStock = `SELECT * FROM stock;`
        const stocks = await SQLUtils.execute(queryStock);
        if (stocks.length == 0) {
            console.log("无股票数据");
            return;
        }

        // 计算ROIC的中位数和方差
        console.log('开始计算ROIC的中位数和方差...');

        for (let index = 0; index < stocks.length; index++) {
            const stockInfo = stocks[index];
            const stockCode = stockInfo.stock_code;

            // 查询指定股票code的ROIC数据
            const querySql = 'SELECT stock_code, stock_name, CAST((roic * 10000) AS decimal(10,0)) as roic FROM roic_calculation where stock_code = ?';
            const queryResult = await SQLUtils.execute(querySql, [stockCode]);
            if (queryResult.length == 0) {
                continue;
            }
            // 计算中位数
            const median = StockUtils.calculateMedian(queryResult) / 10000;
            // 计算方差
            const variance = StockUtils.calculateVariance(queryResult) / 10000;

            //更新股票表中的数据
            const updateSql = 'UPDATE stock SET median_roic = ?, var_roic = ?, report_count = ? WHERE stock_code = ?';
            await SQLUtils.execute(updateSql, [median, variance, queryResult.length, stockCode]);
            console.log(`已成功更新${stockCode}-${queryResult[0].stock_name}的ROIC的中位数和方差: ${median}, ${variance}`);
        }
    },

    /**
     * 计算中位数
     * @param {Array} data 数据
     * @return {Number} median 中位数
     */
    calculateMedian: (data) => {
        const length = data.length;
        if (length == 0) {
            return 0;
        }
        // 按照roic从小到大排序
        data.sort((a, b) => {
            return a.roic - b.roic;
        });

        if (length % 2 == 0) {
            return (data[length / 2 - 1].roic + data[length / 2].roic) / 2;
        } else {
            return data[Math.floor(length / 2)].roic;
        }
    },

    /**
     * 计算方差
     * @param {Array} data 数据
     * @return {Number} variance 方差
     */
    calculateVariance: (data) => {
        const length = data.length;
        if (length == 0) {
            return 0;
        }
        // 计算平均值
        let sum = 0;
        for (let index = 0; index < length; index++) {
            sum += data[index].roic;
        }
        const average = Math.floor(sum / length);
        // 计算方差
        let sum2 = 0;
        for (let index = 0; index < length; index++) {
            sum2 += Math.pow(data[index].roic - average, 2);
        }
        return Math.floor(sum2 / length);
    }
};

module.exports = StockUtils;