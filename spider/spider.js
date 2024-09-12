'use strict';

const puppeteer = require('puppeteer');
const axios = require('axios').default;
const SQLUtils = require('../utils/SQLUtils.js');
const fs = require('fs');

const main = async () => {

    // 1.使用已经打开的浏览器
    // ## 2. chrome创建快捷方式,添加启动参数 --remote-debugging-port=9222
    // ## 3. 打开chrome浏览器
    let wsKey = await axios.get('http://127.0.0.1:9222/json/version');
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsKey.data.webSocketDebuggerUrl,
        slowMo: 50
    });

    const page = await browser.newPage();
    console.log(new Date().toLocaleString() + ' 浏览器已打开');

    // 获取指定年份的roic, 默认获取到2019-2
    // 2024-2 OK
    // 2024-1 OK
    // 2023-4 OK
    // 2023-3 OK
    // 2023-2 OK
    // 2023-1 OK
    // 2022-4 OK
    // 2022-3 OK
    // 2022-2 OK
    // 2022-1 OK
    // 2021-4 OK
    // 2021-3 OK
    // 2021-2 OK
    // 2021-1 OK
    // 2020-4 OK
    // 2020-3 OK
    // 2020-2 ING
    // 指定年份及季度
    // let year = 2024;
    // let year = 2023;
    // let year = 2022;
    // let year = 2021;
    let year = 2020;
    // let year = 2019;
    // let season = 4;
    // let season = 3;
    // let season = 2;
    let season = 1;
    // for (let i = 1; i <= 4; i++) {
    // 2.获取ROIC数据
    await getROICList(page, year, season);
    // season++;
    // }

    // 4.关闭浏览器
    page.close();
}

// 获取剩余规模
const getROICList = async (page, year, seanon) => {
    // 2024年第2季度归属于母公司股东的净利润不为空，全部投入资本不为空
    const keyWord = `${year}年第${seanon}季度归属于母公司股东的净利润不为空,全部投入资本不为空,非ST`;
    console.log(new Date().toLocaleString() + ' 开始获取数据:' + keyWord);
    let bondsList = [];
    let totalPage = 0;
    // 1.打开页面
    // https://www.iwencai.com/stockpick/search?rsh=3&typed=1&preParams=&ts=1&f=1&qs=result_rewrite&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=2021%E5%B9%B4%E4%BA%8C%E5%AD%A3%E5%BA%A6ROIC%E4%B8%8D%E4%B8%BA%E7%A9%BA%2C%E9%9D%9EST&queryarea=
    let url = 'https://www.iwencai.com/stockpick/search?rsh=3&typed=1&preParams=&ts=1&f=1&qs=result_rewrite&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=';
    url += keyWord + '&queryarea=';
    await page.goto(url);
    // 等待加载结束
    await page.waitForSelector('.td-cell-box');
    // 2.每页显示100条
    let dropDown = await page.$$('.xuangu-bottom-tool .drop-down-box');
    await dropDown[0].click();
    await page.waitForSelector('.drop-down-box ul');
    // 选择100条
    let dropDownList = await page.$$('.drop-down-box ul li');
    // 第三个选项为100条，等待加载结束
    const [response] = await Promise.all([
        // 等待加载结束
        page.waitForResponse(response => response.url().indexOf('landing/getDataList') > -1),
        // 点击100条
        dropDownList[2].click()
    ]);
    // 3.获取数据
    const responseBody = await response.json();
    // 总页码,向上取整
    totalPage = Math.ceil(responseBody.answer.components[0].data.meta.extra.code_count / 100);
    // 第一页数据
    let firstPageList = responseBody.answer.components[0].data.datas;
    // 加入列表
    bondsList = bondsList.concat(firstPageList);
    console.log(new Date().toLocaleString() + ' 第1页数据获取成功,共' + totalPage + '页');
    // -----------------
    // 测试代码 仅获取前两页数据
    // totalPage = 1;
    // -----------------

    // 循环获取其他页数据
    for (let i = 2; i <= totalPage; i++) {
        // 下一页节点 .pcwencai-pagination 最后一个li
        let nextPage = await page.$$('.pcwencai-pagination li:last-child a');
        const [responseItem] = await Promise.all([
            // 等待加载结束
            page.waitForResponse(response => response.url().indexOf('landing/getDataList') > -1),
            nextPage[0].click()
        ]);
        // 获取数据
        const responseBody = await responseItem.json();
        // 当前页数据
        let otherPageList = responseBody.answer.components[0].data.datas;
        // 加入列表
        bondsList = bondsList.concat(otherPageList);
        console.log(new Date().toLocaleString() + ' 第' + i + '页数据获取成功,共' + totalPage + '页');

        // 等待2s
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2500);
        });
    }

    console.log(new Date().toLocaleString() + ' 数据获取完毕,共' + bondsList.length + '条数据');

    // 3.整理数据
    // 3.1 替换掉多余的字符: 如 [20231106]
    let bondsJSON = JSON.stringify(bondsList);
    bondsJSON = bondsJSON.replace(/\[\d+\]/g, '');
    // 3.2 转换为JSON对象
    bondsList = JSON.parse(bondsJSON);
    let finalList = [];
    bondsList.forEach(function (item, index) {
        let stock = {};
        stock.stock_code = item["code"];
        stock.stock_name = item["股票简称"];
        stock.report_date = year + '-' + seanon;
        stock.net_profit = item["归属于母公司所有者的净利润"] ? item["归属于母公司所有者的净利润"] / 100000000 : 0;
        // '6.02799666E10' 转换为亿级别二位小数
        stock.end_total_invested_capital = item["全部投入资本"] ? item["全部投入资本"] / 100000000 : 0;
        finalList.push(stock);
    });

    // 写入文件
    let result = finalList;
    // 写入json文件
    let json = JSON.stringify(result);
    // "scale":" 替换为 "scale":
    // json = json.replace(/"scale":"/g, '"scale":');
    // "} 替换为 }
    // json = json.replace(/"\}/g, '}');
    fs.writeFileSync(`./output/roics_${year + '-' + seanon}.json`, json);

    // 保存到数据库
    let sql = 'INSERT INTO roic_calculation(stock_code, stock_name, report_date, net_profit, end_total_invested_capital) VALUES ?';
    let params = [];
    finalList.forEach(function (item, index) {
        params.push([item.stock_code, item.stock_name, item.report_date, item.net_profit, item.end_total_invested_capital]);
    });
    const resultSQL = await SQLUtils.execute(sql, [params]);
    console.log(new Date().toLocaleString() + ' 数据写入数据库成功,共' + resultSQL.affectedRows + '条数据');

    console.log(new Date().toLocaleString() + ' 数据写入文件成功');
}

(async () => {
    await main();
    process.exit(0);
})();