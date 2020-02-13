## WEDEX 提现工具：

## 环境准备：  
1. 安装node stable版本 (v12.x.x)
2. 准备好一个eth账号，将私钥保存到当前目录的.privatekey文件中  
3. 执行npm install   

## 查询：  
> node withdraw.js -q <eth-address>

## 执行提现：   
提现发起的账号是.privatekey私钥对应的账号，可以给任何的账号做提现。  
> node withdraw.js -i <account-id> <token-id>

## 示例：  
执行`node withdraw.js -q 0x6bd5d6fE42419e9039323f9D25B6484F5344f00D`，得到输出：

~~~
accountID: 5
 ETH  TokenId: 0   余额: 0.116158
 LRC  TokenId: 2   余额: 398
USDT  TokenId: 3   余额: 0
~~~

如上所示，ETH的tokenId为0  
如果要提现ETH，则执行 `node withdraw.js -i 0x6bd5d6fE42419e9039323f9D25B6484F5344f00D 0` 即可。  
