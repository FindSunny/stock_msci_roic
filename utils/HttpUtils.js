// 严格模式
'use strict';

const axios = require('axios').default;

const HttpUtils = {

    /**
     * 巨潮接口地址
     */
    getBaseUrl: () => {
        return 'http://webapi.cninfo.com.cn/api/stock/';
    },

    /**
     * 获取利润表数据
     * @param {String} stockCode 股票代码
     * @param {String} sdate 开始日期
     * @param {String} edate 结束日期
     * @returns {Promise}
     */
    getProfitData: async (stockCode, sdate, edate) => {

        try {
            // 参数
            const url = HttpUtils.getBaseUrl()
                + 'p_stock2301?scode=' + stockCode
                + '&type=071001&@column=SECCODE,SECNAME,F001D,F018N,F012N,F024N,F025N&sdate='
                + sdate + '&edate=' + edate;

            // 请求数据
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive',
                    'Host': ' webapi.cninfo.com.cn',
                    'Origin': 'http://webapi.cninfo.com.cn',
                    'Referer': 'http://webapi.cninfo.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest',
                    'mcode': HttpUtils.getMCode()
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }

    },

    /**
     * 获取资产负债表数据
     * @param {String} stockCode 股票代码
     * @param {String} sdate 开始日期
     * @param {String} edate 结束日期
     * @returns {Promise}
     */
    getBalanceData: async (stockCode, sdate, edate) => {
        try {
            // 参数
            const url = HttpUtils.getBaseUrl()
                + 'p_stock2300?scode=' + stockCode
                + '&type=071001&@column=SECCODE,SECNAME,F001D,F039N,F050N,F053N,F054N,F055N,F059N,F070N&sdate='
                + sdate + '&edate=' + edate;

            // 请求数据
            const response = await axios.post(url, {}, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive',
                    'Host': ' webapi.cninfo.com.cn',
                    'Origin': 'http://webapi.cninfo.com.cn',
                    'Referer': 'http://webapi.cninfo.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest',
                    'mcode': HttpUtils.getMCode()
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },

    /**
     * missjson, 复制自巨潮json2csv.js
     */
    missjson: (input) => {
        var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";
        var chr1, chr2, chr3 = "";
        var output = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;

    },


    /**
     * 生成mCode
     */
    getMCode: () => {
        let time = Math.floor(new Date().getTime() / 1000); return HttpUtils.missjson("" + time);
    },
}

module.exports = HttpUtils;