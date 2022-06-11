// 严格模式
'use strict';

const mysql = require('mysql');

const SQLUtils = {

    /**
     * sqlConfig
     */
    mysqlConifg: () => {
        return {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'msci_stock',
            port: 3306,
            connectionLimit: 10,
            multipleStatements: true,
            connectTimeout: 120000
        };
    },

    /**
     * 批量插入股票代码列表
     * 
     * @param {String} sql sql语句
     * @param {Object} params 参数
     * @return {Promise}
     */
    execute: async (sql, params) => {

        // 连接数据库
        let connection = mysql.createConnection(SQLUtils.mysqlConifg());
        connection.connect()
        // 同步执行sql语句
        return new Promise((resolve, reject) => {
            connection.query(sql, params, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
                connection.end();
            });
        });
    },
};

module.exports = SQLUtils;