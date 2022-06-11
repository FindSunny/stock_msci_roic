// 严格模式
'use strict';

const SQLUtils = require('./SQLUtils.js');
const HttpUtils = require('./HttpUtils.js');

const StockUtils = {

    /**
     * 批量插入股票代码列表
     * @param {*} stockList 股票代码列表 
     * @param {*} season 插入季度
     * @returns 
     */

    insertStockList: async (stockList, season) => {

        // 查看数据库有无数据
        const querySql = 'SELECT * FROM stock where season = ?';
        const queryResult = await SQLUtils.execute(querySql, [season]);
        if (queryResult.length > 0) {
            console.log('数据库已有数据，不需要插入数据');
            return;
        }

        // 整理股票代码列表
        const stockCodeList = [];
        for (let index = 0; index < stockList.length; index++) {
            const stockCode = stockList[index];
            stockCodeList.push('("' + stockCode + '","' + season + '")');

        }
        const sql = `INSERT INTO stock (stock_code, season) VALUES ${stockCodeList.join(',')}`;
        // 执行sql语句
        const result = await SQLUtils.execute(sql);
        // 打印日志
        console.log('股票信息表，数据已插入: ', result.affectedRows, '条数据');
        return result;

    },

    /**
     * 批量插入利润表数据
     * 
     * @param {String} stockCode 股票代码
     * @param {Array} profitList 利润表数据
     * @return {Promise}
     */
    insertProfitData: async (stockCode, profitList) => {

        // 整理利润表数据
        const profitDataList = [];
        for (let index = 0; index < profitList.length; index++) {
            const profitData = profitList[index];
            profitDataList.push('("' + stockCode + '","'
                + profitData.SECNAME + '","'
                + profitData.F001D + '","'
                + (profitData.F018N ? profitData.F018N : 0) + '","'
                + (profitData.F012N ? profitData.F012N : 0) + '","'
                + (profitData.F024N ? profitData.F024N : 0) + '","'
                + (profitData.F025N ? profitData.F025N : 0) + '")');
        }
        const sql = `INSERT INTO income_statement (stock_code, stock_name, report_date, 
            finance_expense, profit_from_operation, profit_beforetax, less_incometax
            ) VALUES ${profitDataList.join(',')}`;
        // 执行sql语句
        const result = await SQLUtils.execute(sql);
        // 打印日志
        console.log('已插入利润表数据, 股票代码: ', stockCode, '共', result.affectedRows, '条数据');
    },

    /**
     * 批量插入资产负债表数据
     * 
     * @param {String} stockCode 股票代码
     * @param {Array} balanceList 资产负债表数据
     * @return {Promise}
    */
    insertBalanceData: async (stockCode, balanceList) => {

        // 整理资产负债表数据
        const balanceDataList = [];
        for (let index = 0; index < balanceList.length; index++) {
            const balanceData = balanceList[index];
            balanceDataList.push('("' + stockCode + '","'
                + balanceData.SECNAME + '","'
                + balanceData.F001D + '","'
                + (balanceData.F039N ? balanceData.F039N : 0) + '","'
                + (balanceData.F050N ? balanceData.F050N : 0) + '","'
                + (balanceData.F053N ? balanceData.F053N : 0) + '","'
                + (balanceData.F054N ? balanceData.F054N : 0) + '","'
                + (balanceData.F055N ? balanceData.F055N : 0) + '","'
                + (balanceData.F059N ? balanceData.F059N : 0) + '","'
                + (balanceData.F070N ? balanceData.F070N : 0) + '")');
        }
        // 整理SQL语句
        const sql = `INSERT INTO balance_sheet (stock_code, 
            stock_name, report_date, short_term_loans, 
            one_year_current_liability, long_term_loans, 
            bonds_payable, long_term_payable, other_current_liability, owners_equity
            ) VALUES ${balanceDataList.join(',')}`;
        // 执行sql语句
        const result = await SQLUtils.execute(sql);
        // 打印日志
        console.log('已插入资产负债表数据, 股票代码: ', stockCode, '共', result.affectedRows, '条数据');
    },


    /**
     * 批量获取MSCI股票数据
     * @param {Array} stockList 股票列表
     * @param {Function} callback 回调函数
     * @return {Array} 股票数据
     */
    fetchStockData: async (stockList) => {
        // 获取当前年月
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const edate = year + '-' + (month < 10 ? '0' + month : month) + '-01';
        // 获取上5年的年月
        const sdate = year - 5 + '-' + (month < 10 ? '0' + month : month) + '-01';

        // 获取利润表数据
        await StockUtils.fetchProfitData(stockList, sdate, edate);

        // 获取资产负债表数据
        await StockUtils.fetchBalanceData(stockList, sdate, edate);

        // 打印日志
        console.log('已获取全部股票数据');
    },

    /**
     * 批量获取利润表数据
     * @param {Array} stockList 股票列表
     * @return {*} result 处理结果
     */
    fetchProfitData: async (stockList, sdate, edate) => {

        // 获取利润表数据
        for (let index = 0; index < stockList.length; index++) {
            const stockCode = stockList[index];

            // 查看数据库有无数据
            const querySql = 'SELECT * FROM income_statement where stock_code = ?';
            const queryResult = await SQLUtils.execute(querySql, [stockCode]);
            if (queryResult.length > 0) {
                console.log('利润表数据已有数据，不需要查询数据：', stockCode);
                continue;
            }

            let data = await HttpUtils.getProfitData(stockCode, sdate, edate);
            if (data.resultcode == '200') {
                // 插入利润表数据
                await StockUtils.insertProfitData(stockCode, data.records);
            } else {
                console.log(data.resultcode + ': ' + data.resultmsg);
            }
        }

    },

    /**
     * 批量获取资产负债表数据
     * @param {Array} stockList 股票列表
     * @return {*} result 处理结果
     */
    fetchBalanceData: async (stockList, sdate, edate) => {

        // 获取资产负债表数据
        for (let index = 0; index < stockList.length; index++) {
            const stockCode = stockList[index];

            // 查看数据库有无数据
            const querySql = 'SELECT * FROM balance_sheet where stock_code = ?';
            const queryResult = await SQLUtils.execute(querySql, [stockCode]);
            if (queryResult.length > 0) {
                console.log('资产负债表数据已有数据，不需要查询数据：', stockCode);
                continue;
            }

            let data = await HttpUtils.getBalanceData(stockCode, sdate, edate);
            if (data.resultcode == '200') {
                // 插入资产负债表数据
                await StockUtils.insertBalanceData(stockCode, data.records);
            } else {
                console.log(data.resultcode + ': ' + data.resultmsg);
            }
        }

    },
};

module.exports = StockUtils;