wechat
微信小程序开发，主要熟悉小程序的开发流程，小程序的设计风格包括目录设计js,json,wxml,wxss四个部分
根目录下app.文件对应整个app的全局设计，包括app.json全局window样式设计风格，page文件的配置，taBar的设置，网络请求，debug等;
app.wxss设置全局公共的样式;
app.js设置全局引用的变量globalData,在单页面中const app = getApp();
小程序的生命周期onload(option){}可以在option中获取地址参数；
小程序分享朋友onShareAppMessage();分享朋友圈canvas绘图；
登录授权等
