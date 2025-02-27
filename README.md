# README #

易購網購物平台，前後端分離的系統架構，前端Vite + Vue 3，後端使用node.js(express.js)

## Project setup (backeend) ##

```
cd backend
npm install
```

### Run develop mode ###

```
cp .env.example .env.dev.local
npm run dev
```

### Run production mode ###

```
cp .env.example .env.production.local
npm run start
```
or

```
cp .env.example .env
node app.js
```

## Project setup (frontend) ##

```
cd vite
npm install
```

### Run develop mode ###

```
cp .env.example .env
npm run dev
```
### Compiles for production ###

```
npm run build    #這會複製dist資料夾到後端(/backend/public/)
```

### Git 切換筆記 ###

```
git remote -v                              #列出遠端URL
git branch --move master main              #移動分支到main
git remote set-url origin <GIT_URL_HERE>   #設定遠端url
git push --set-upstream origin main        #指定推到main
```

### 筆記 ###

* 2024/09/27 溝通時間格式，https://apiux.com/2013/03/20/5-laws-api-dates-and-times/
* 2024/09/10 api溝通json格式都不要用字串，formData可以，因為formData欄位只允許帶字串
* 2023/11/25 使用vite和validatorjs套件在設定語言上會有點問題，必須預設英文再複寫
* 2023/12/02 使用vite和validatorjs套件在我自己寫的wrapValidator function裡面，會有不穩定的錯誤，有時沒問題有時有問題，並且在設定語系使用useLang，也會有問題，必須使用setMessages。  
api溝通資料型態可以不限定，數字可接受'123'或123，因為在後端都可以辨識，省去前端轉換的問題，transtype function在前端會有問題，第一次成功之後再失敗會出錯。