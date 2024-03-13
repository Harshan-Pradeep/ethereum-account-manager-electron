"use strict";
const electron = require("electron");
const path = require("node:path");
const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/45428ab040a246b28ba479c3bf6f780d");
let senderBalance;
const senderPrivateKey = "89a7b709cb47c092bea5f282fba3f7a93034e8ef813750a5fb192d37644d4c0b";
let createdAccounts = [];
const getBalanceSourceAccount = async () => {
  const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
  const balance = await provider.getBalance(senderWallet.address);
  senderBalance = ethers.formatEther(balance);
  console.log(`Balance of sender before transaction: ${senderBalance} ETH`);
};
async function sendETHMultiple(recipientAddresses, amount, sourceAddress, sourcePrivateKey) {
  const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);
  for (const recipientAddress of recipientAddresses) {
    const tx = {
      to: recipientAddress,
      // Convert the amount to Wei (1 ETH = 10^18 Wei)
      value: ethers.parseEther(amount),
      // Set a gas limit for the transaction
      gasLimit: 1e5
      // 100,000 gas
    };
    const transaction = await sourceWallet.sendTransaction(tx);
    console.log(`Transaction hash for ${recipientAddress}: ${transaction.hash}`);
    await transaction.wait();
    console.log(`Transaction to ${recipientAddress} confirmed!`);
  }
}
const createAccounts = async (numberOfAccounts) => {
  createdAccounts = [];
  for (let i = 0; i < numberOfAccounts; i++) {
    const wallet = ethers.Wallet.createRandom();
    createdAccounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: "0"
    });
  }
  console.log("Created accounts:", createdAccounts);
  return createdAccounts;
};
const transferFunds = async () => {
  await getBalanceSourceAccount();
  const sourceBalance = parseFloat(senderBalance);
  const gasPrice = (await provider.getFeeData()).gasPrice;
  const gasLimit = BigInt(21e3);
  const txCost = parseFloat(ethers.formatUnits(gasPrice * gasLimit, "ether"));
  const totalTxCost = txCost * createAccounts.length;
  if (sourceBalance < totalTxCost) {
    throw new Error("Insufficient funds to cover the transaction costs.");
  }
  const amountToSend = ((sourceBalance - totalTxCost) / createdAccounts.length).toFixed(6);
  const recipientAddresses = createdAccounts.map((account) => account.address);
  try {
    await sendETHMultiple(
      recipientAddresses,
      amountToSend.toString(),
      "0xE6798FCa40F9cD945e06a0fFbB12e4e53a30c400",
      senderPrivateKey
    );
  } catch (error) {
    console.error(error.message);
  } finally {
    for (let account of createdAccounts) {
      const newBalance = await provider.getBalance(account.address);
      account.balance = ethers.formatEther(newBalance);
    }
    console.log("Updated accounts with new balances:", createdAccounts);
    return {
      message: "Funds transferred successfully!",
      accounts: createdAccounts
    };
  }
};
const transferRandomFunds = async () => {
  const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
  const sourceWallet = createdAccounts[sourceIndex];
  createdAccounts.length;
  for (let i = 0; i < createdAccounts.length; i++) {
    if (i !== sourceIndex) {
      let recipientWallet = createdAccounts[i];
      let transferAmount = parseFloat((Math.random() * (sourceWallet.balance - buffer)).toFixed(6));
      console.log("transferAmount", transferAmount);
      try {
        await sendETH(sourceWallet.privateKey, recipientWallet, transferAmount);
        console.log(`Transaction successful! New balance of ${sourceWallet.address}: ${sourceWallet.balance} ETH`);
        console.log(`New balance of ${recipientWallet.address}: ${recipientWallet.balance} ETH`);
      } catch (error) {
        console.error(`Transaction failed: ${error.message}`);
      }
    }
  }
  return {
    message: "Random funds transferred successfully!",
    accounts: createdAccounts
  };
};
const transferRemainingFunds = async () => {
  const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
  const recipientWallet = createdAccounts[recipientIndex];
  const buffer2 = 1e-4;
  for (let i = 0; i < createdAccounts.length; i++) {
    if (i !== recipientIndex) {
      const sourceWallet = createdAccounts[i];
      const transferAmount = sourceWallet.balance - buffer2;
      console.log("transferAmount", transferAmount);
      try {
        await sendETH(sourceWallet.privateKey, recipientWallet, transferAmount);
        console.log(`Transaction successful! New balance of ${sourceWallet.address}: ${sourceWallet.balance} ETH`);
        console.log(`New balance of ${recipientWallet.address}: ${recipientWallet.balance} ETH`);
      } catch (error) {
        console.error(`Transaction failed: ${error.message}`);
      }
    }
  }
  console.log("Remaining funds transferred successfully!");
  console.log(`Recipient address ${recipientWallet.address} new balance: ${recipientWallet.balance} ETH`);
  return {
    message: "Remaining funds transferred successfully!",
    accounts: createdAccounts
  };
};
const { ipcMain } = require("electron");
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1e3,
    height: 1600,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("create-accounts", async (event, numberOfAccounts) => {
  const accounts = await createAccounts(numberOfAccounts);
  event.reply("accounts-created", accounts);
});
ipcMain.on("transfer-funds", async (event) => {
  try {
    const response = await transferFunds();
    electron.dialog.showMessageBox({
      type: "info",
      title: "Transfer Random Funds",
      message: response.message
    });
    event.reply("funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    electron.dialog.showMessageBox({
      type: "error",
      title: "Transfer Random Funds Error",
      message: errorMessage
    });
  }
});
ipcMain.on("transfer-random-funds", async (event) => {
  try {
    const response = await transferRandomFunds();
    console.log(response.message);
    console.log("Updated accounts balance:", response.accounts);
    electron.dialog.showMessageBox({
      type: "info",
      title: "Transfer Random Funds",
      message: response.message
    });
    event.reply("random-funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error occurred:", errorMessage);
    electron.dialog.showMessageBox({
      type: "error",
      title: "Transfer Random Funds Error",
      message: errorMessage
    });
  }
});
ipcMain.on("transfer-remaining-funds", async (event) => {
  try {
    const response = transferRemainingFunds();
    electron.dialog.showMessageBox({
      type: "info",
      title: "Transfer Random Funds",
      message: response.message
    });
    event.reply("remaining-funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    electron.dialog.showMessageBox({
      type: "error",
      title: "Transfer Random Funds Error",
      message: errorMessage
    });
  }
});
electron.app.whenReady().then(createWindow);
