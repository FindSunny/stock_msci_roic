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
                stock_name: stockInfo.name
            });
        }
        const sql = `INSERT INTO stock (stock_code, stock_name) VALUES ?`;
        const params = [];
        for (let index = 0; index < stockCodeList.length; index++) {
            const stock = stockCodeList[index];
            params.push([stock.stock_code, stock.stock_name]);
        }
        // 执行sql语句
        const result = await SQLUtils.execute(sql, [params]);
        // 打印日志
        console.log('股票信息表，数据已插入: ', result.affectedRows, '条数据');
        return result;

    },

    /**
     * 计算MSCI股票ROIC数据
     * @return {*} result 处理结果
     */
    calculateStockROIC: async () => {

        // 清空ROIC表数据
        console.log('开始清空ROIC表数据...');
        await SQLUtils.execute('DELETE FROM roic_calculation');
        console.log('已清空ROIC表数据!');

        // 插入ROIC表的利润和资产负债数据
        // 组织SQL语句
        let sql = `INSERT INTO roic_calculation (
                    stock_code,
                    stock_name,
                    report_date,
                    finance_expense,
                    profit_from_operation,
                    profit_beforetax,
                    less_incometax,
                    short_term_loans,
                    one_year_current_liability,
                    long_term_loans,
                    bonds_payable,
                    long_term_payable,
                    other_current_liability,
                    owners_equity,
                    profil_aftertax,
                    begin_invested,
                    roic
                ) SELECT
                    a.stock_code AS stock_code,
                    a.stock_name AS stock_name,
                    b.report_date AS report_date,
                    a.finance_expense AS finance_expense,
                    a.profit_from_operation AS profit_from_operation,
                    a.profit_beforetax AS profit_beforetax,
                    a.less_incometax AS less_incometax,
                    b.short_term_loans AS short_term_loans,
                    b.one_year_current_liability AS one_year_current_liability,
                    b.long_term_loans AS long_term_loans,
                    b.bonds_payable AS bonds_payable,
                    b.long_term_payable AS long_term_payable,
                    b.other_current_liability AS other_current_liability,
                    b.owners_equity AS owners_equity,
                    CAST(
                        (
                            finance_expense + profit_from_operation
                        ) * (
                            1 - (
                                less_incometax / profit_beforetax
                            )
                        ) AS DECIMAL (60, 2)
                    ) AS profil_aftertax,
                    CAST(
                        short_term_loans + one_year_current_liability + long_term_loans + bonds_payable + long_term_payable + other_current_liability + owners_equity AS DECIMAL (60, 2)
                    ) AS begin_invested,
                    CAST(
                        CAST(
                            (
                                finance_expense + profit_from_operation
                            ) * (
                                1 - (
                                    less_incometax / profit_beforetax
                                )
                            ) AS DECIMAL (60, 2)
                        ) / CAST(
                            short_term_loans + one_year_current_liability + long_term_loans + bonds_payable + long_term_payable + other_current_liability + owners_equity AS DECIMAL (60, 2)
                        ) AS DECIMAL (60, 4)
                    ) AS roic
                FROM
                    income_statement a
                INNER JOIN balance_sheet b ON a.stock_code = b.stock_code
                AND a.report_date = b.report_date;`;
        console.log('开始插入ROIC表的利润和资产负债数据，耗时较长，请耐心等待...');
        await SQLUtils.execute(sql);
        console.log('已成功插入ROIC表的利润和资产负债数据!');
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
            const stockCode = stockInfo.stock_code ;

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
            const updateSql = 'UPDATE stock SET median_roic = ?, var_roic = ? WHERE stock_code = ?';
            await SQLUtils.execute(updateSql, [median, variance, stockCode]);
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