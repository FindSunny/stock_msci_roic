# stock_msci_roic
ROIC based on MSCI index

## 请注意
初代版本：本代码需要连接本地Mysql数据库进行数据计算
最终产出ROIC excel文档。

## 零，执行步骤

### 1. 安装依赖
```cmd
npm install
```

### 2. 获取全部A股股票代码
同花顺问财下载

### 3. 获取MSCI China成分股
> 通过东方财富网站获取 [东方财富JSON](https://63.push2.eastmoney.com/api/qt/clist/get?cb=jQuery112406205413974464327_1726127104502&pn=1&pz=2000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&dect=1&wbp2u=|0|0|0|web&fid=f3&fs=b:BK0821+f:!50&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f45&_=1726127104511)

### 4. 获取并插入ROIC数据
执行 ``` ./spider/spider.js ``` 获取当季或者历史的ROIC数据

### 5. 按顺序执行 ``` index.js ``` 中的代码
> 1. 将股票列表，插入数据库
> 2. 计算股票ROIC数据（耗时较长）
> 3. 分析MSCI股票ROIC数据（中位数及方差）
> 4. 输出ROIC数据到Excel



## 一, ROIC是什么？
ROIC = NOPLAT ÷ IC （投资资本回报率 = 税后经营利润 ÷ 期初投入资本）

    § NOPLAT = EBIT × （1 - Tax）  (税后经营利润 = 息税前利润 × （1 - 税率）)
        □ EBIT = 营业利润   + 财务费用
        □ 税率 = 所得税 ÷ 利润总额

    § IC = 股东权益 + 有息负债
        □ 股东权益 = 所有者权益
        □ 有息负债 =  短期借款 + 长期借款 + 一年内到期的非流动负债 + 应付债券 + 长期应付款 + 其他流动负债

> 2024-09-11 更新算法
ROIC＝归属于母公司股东的净利润×2／（期初全部投入资本＋期末全部投入资本）
> ※使用同花顺问财直接获取ROIC数据，可忽略后续计算步骤
https://www.iwencai.com/stockpick/search?rsh=3&typed=1&preParams=&ts=1&f=1&qs=result_rewrite&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=2021年二季度ROIC不为空,非ST&queryarea=


## 二,MSCI China ROIC精选好企业（By 三思社）
ROIC相较于其他指标可以更真实的反映公司主营业务运营的真实情况，尤其是剔除了财务杠杆和非经常损益的影响。在此我通过ROIC来筛选MSCI Chian成分股中的“优质股”，即拥有高且稳定ROIC的企业，这些企业有较深的护城河及竞争优势。
### 第一步。
将MSCI China的全部成分股，按照过去20个季度ROIC的中位数进行高低排序，剔除后50%
### 第二步。
计算过去20个季度ROIC的方差，将方差波动最大的50%剔除

## 获取成分股，方法一：
### MSCI China Index Download
https://www.msci.com/msci%E6%8C%87%E6%95%B0%E4%BF%A1%E6%81%AF

### PDF -> TXT
https://app.xunjiepdf.com/ocrpdf/
## 获取成分股，方法二(推荐)：

### 同花顺下载
http://www.iwencai.com/stockpick/search?typed=1&preParams=&ts=1&f=1&qs=result_original&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=MSCI

## 巨潮API地址
http://webapi.cninfo.com.cn/#/apiDoc

### 巨潮API - header中，mcCode获取
#### 1. 打开 http://webapi.cninfo.com.cn/#/dataBrowse
#### 2. F12查看文件： json2csv.js
#### 3. indexCode，即mcCode

## 三，其他
> mysql安装 https://dev.mysql.com/downloads/mysql/

### 1. 安装mysql 8.0最好

### 2. 切换认证模式至 mysql_native_password, 以支持Node.js连接
```cmd
mysql -u root
use mysql;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'toor';
FLUSH PRIVILEGES;
EXIT;
```
