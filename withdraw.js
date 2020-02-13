// var async = require("async");
const fs = require("fs");
const Web3 = require("web3"); // tslint:disable-line
const PrivateKeyProvider = require("truffle-privatekey-provider");
const allAccounts = require("./accounts.json");

const privKey = fs.readFileSync("./.privatekey", "ascii").trim();
const exchangeABI = fs.readFileSync("exchange.abi", "ascii");

const provider = new PrivateKeyProvider(privKey, "https://mainnet.infura.io/v3/a06ed9c6b5424b61beafff27ecc3abf3");
const web3 = new Web3(provider);

const zeroAddress = "0x" + "00".repeat(20);
const lrcAddress = "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD";
const exchangeAddr = "0x7D3D221A8D8AbDd868E8e88811fFaF033e68E108";

function getAccountInfo(accountId) {
  for (const acc of allAccounts) {
    if (acc.accountID == accountId) {
      return acc;
    }
  }
  return undefined;
}

function getTokenInfo(accountInfo, tokenId) {
  for (const tokenInfo of accountInfo.tokens) {
    if (tokenInfo.tokenId == tokenId) {
      return tokenInfo;
    }
  }
  return undefined;
}

function printAccountAndTokenInfo(accountId) {
  console.log("accountID:", accountId);

  const accountInfo = getAccountInfo(accountId);

  const ethInfo = getTokenInfo(accountInfo, 0);
  console.log(" ETH ", "TokenId: 0 ", " 余额:", ethInfo.balance / 1e18);
  const lrcInfo = getTokenInfo(accountInfo, 2);
  console.log(" LRC ", "TokenId: 2 ", " 余额:", lrcInfo.balance / 1e18);
  const usdtInfo = getTokenInfo(accountInfo, 3);
  console.log("USDT ", "TokenId: 3 ", " 余额:", usdtInfo.balance / 1e18);

  return;
}

async function withdraw(accountAddr, tokenId) {
  const accountId = await queryAccountId(accountAddr);
  console.log("开始提现，账号ID:", accountId, "; tokenID:", tokenId);

  const accounts = await web3.eth.getAccounts();
  const owner = accounts[0];

  const accountInfo = getAccountInfo(accountId);
  if (!accountInfo) {
    console.log("账号信息为空，ID：", accountId);
    return;
  }
  const tokenInfo = getTokenInfo(accountInfo, tokenId);
  if (!tokenInfo) {
    console.log("token信息为空，token ID：", tokenId);
    return;
  }

  if (tokenInfo.balance == "0") {
    console.log("token余额为0，退出。");
    return;
  }

  const exchangeInstance = new web3.eth.Contract(JSON.parse(exchangeABI), exchangeAddr);
  const sendOpts = { from: owner, gas: 2200000, gasPrice: 3000000000 };

  // console.log(
  //   lrcAddress,
  //   accountInfo.publicX,
  //   accountInfo.publicY,
  //   accountInfo.nonce,
  //   tokenInfo.balance,
  //   tokenInfo.tradeHistoryRoot,
  //   accountInfo.path,
  //   tokenInfo.path,
  // );
  console.log("发送以太坊提现交易...");

  const tx = await exchangeInstance.methods.withdrawFromMerkleTreeFor(
    accountAddr,
    lrcAddress,
    accountInfo.publicX,
    accountInfo.publicY,
    accountInfo.nonce,
    tokenInfo.balance,
    tokenInfo.tradeHistoryRoot,
    accountInfo.path,
    tokenInfo.path,
  ).send(sendOpts);

  console.log("tx:", tx);
  process.exit(0);
}

async function queryAccountId(addr) {
  const exchangeInstance = new web3.eth.Contract(JSON.parse(exchangeABI), exchangeAddr);
  const accountInfo = await exchangeInstance.methods.getAccount(addr).call();
  // console.log("accountInfo:", accountInfo);
  if (!accountInfo || !accountInfo.accountID) {
    console.log("无效的eth地址：", addr);
    process.exit(1);
  }
  return accountInfo.accountID;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] == "-q") {
    const userAddr = args[1];
    const accountId = await queryAccountId(userAddr);
    printAccountAndTokenInfo(accountId);
    process.exit(0);
  } else if (args[0] == "-i") {
    const accountAddr = args[1];
    const tokenId = args[2];
    await withdraw(accountAddr, tokenId);
  } else {
    console.log("Error: Invalid arguments");
    console.log("Options:");
    console.log("  -q", "<eth-address>");
    console.log("  -i", "<eth-address>", "<token-id>");
  }
}

main();
