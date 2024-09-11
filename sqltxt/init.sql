-- 创建数据库
CREATE DATABASE msci_stock
    DEFAULT CHARACTER SET = 'utf8mb4';

-- 股票信息表
CREATE TABLE `msci_stock`.`stock` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stock_code` varchar(255) DEFAULT NULL COMMENT '股票代码',
  `stock_name` varchar(255) DEFAULT NULL COMMENT '股票名称',
  `median_roic` decimal(10,4) DEFAULT '0.0000' COMMENT 'ROIC中位数',
  `var_roic` decimal(10,4) DEFAULT '0.0000' COMMENT 'ROIC方差',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ROIC计算表 roic_calculation
CREATE TABLE `msci_stock`.`roic_calculation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stock_code` varchar(255) DEFAULT NULL,
  `stock_name` varchar(255) DEFAULT NULL COMMENT '名称',
  `report_date` varchar(255) DEFAULT NULL COMMENT '报告年度',
  `roic` decimal(10,4) DEFAULT '0.0000' COMMENT '本期ROIC计算',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


select * from msci_stock.stock where median_roic > 0;