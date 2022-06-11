# stock_msci_roic
ROIC based on MSCI index


# 获取成分股，方法一：
## MSCI China Index Download
https://www.msci.com/msci%E6%8C%87%E6%95%B0%E4%BF%A1%E6%81%AF

## PDF -> TXT
https://app.xunjiepdf.com/ocrpdf/
# 获取成分股，方法二(推荐)：

## 同花顺下载
http://www.iwencai.com/stockpick/search?typed=1&preParams=&ts=1&f=1&qs=result_original&selfsectsn=&querytype=stock&searchfilter=&tid=stockpick&w=MSCI

## 巨潮API地址
http://webapi.cninfo.com.cn/#/apiDoc

## 巨潮API - header中，mcCode获取
### 1. 打开 http://webapi.cninfo.com.cn/#/dataBrowse
### 2. F12查看文件： json2csv.js
### 3. indexCode，即mcCode