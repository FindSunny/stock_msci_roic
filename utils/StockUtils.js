// 严格模式
'use strict';

const SQLUtils = require('./SQLUtils.js');

const StockUtils = {

    insertStockList: async (stockList) => {

        // 查看数据库有无数据
        const querySql = 'SELECT * FROM stock';
        const queryResult = await SQLUtils.execute(querySql);
        if (queryResult.length > 0) {
            console.log('数据库已有数据，不需要插入数据');
            return;
        }

        // 整理股票代码列表
        const stockCodeList = [];
        for (let index = 0; index < stockList.length; index++) {
            const stockCode = stockList[index];
            stockCodeList.push('("' + stockCode + '")');
            
        }
        const sql = `INSERT INTO stock (stock_code) VALUES ${stockCodeList.join(',')}`;
        // 执行sql语句
        const result = await SQLUtils.execute (sql);
        return result;

    },


    /**
     * 批量获取MSCI股票数据
     * @param {Array} stockList 股票列表
     * @param {Function} callback 回调函数
     * @return {Array} 股票数据
     */
    getStockData: function (stockList, callback) {
        const stockData = [];
        const stockListLength = stockList.length;
        let stockListIndex = 0;
    }
};

module.exports = StockUtils;