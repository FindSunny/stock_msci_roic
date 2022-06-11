# stock_msci_roic
ROIC based on MSCI index

## 一, ROIC是什么？
ROIC = NOPLAT ÷ IC （投资资本回报率 = 税后经营利润 ÷ 期初投入资本）

    § NOPLAT = EBIT × （1 - Tax）  (税后经营利润 = 息税前利润 × （1 - 税率）)
        □ EBIT = 营业利润   + 财务费用
        □ 税率 = 所得税 ÷ 利润总额

    § IC = 股东权益 + 有息负债
        □ 股东权益 = 所有者权益
        □ 有息负债 =  短期借款 + 长期借款 + 一年内到期的非流动负债 + 应付债券 + 长期应付款 + 其他流动负债


扣除调整税后的净营业利润 = 

## 二,MSCI China ROIC精选好企业（By 三思社）
ROIC相较于其他指标可以更真实的反映公司主营业务运营的真实情况，尤其是提出了财务杠杆和非经常损益的影响。在此我通过ROIC来筛选MSCI Chian成分股中的“优质股”，即拥有高且稳定ROIC的企业，这些企业有较深的护城河及竞争优势。
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