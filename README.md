# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

### 筆記 ###


2024/9/10 api溝通json格式都不要用字串，formData可以，因為formData欄位只允許帶字串

2023/11/25 使用vite和validatorjs套件在設定語言上會有點問題，必須預設英文再複寫
2023/12/02 使用vite和validatorjs套件在我自己寫的wrapValidator function裡面，
					 會有不穩定的錯誤，有時沒問題有時有問題，並且在設定語系使用useLang，
					 也會有問題，必須使用setMessages
					 
					 api溝通資料型態可以不限定，數字可接受'123'或123，因為在後端都可以辨識
					 省去前端轉換的問題，
					 transtype function在前端會有問題，第一次成功之後再失敗會出錯
					 api溝通資料如果是時間欄位必須是utc+0的時區