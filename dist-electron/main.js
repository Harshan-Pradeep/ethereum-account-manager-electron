"use strict";
const electron = require("electron");
const path = require("node:path");
const { ethers } = require("ethers");
let createdAccounts = [];
const createAccounts = (numberOfAccounts) => {
  createdAccounts = [];
  const virtualBalance = "5000000000000000000";
  for (let i = 0; i < numberOfAccounts; i++) {
    const wallet = ethers.Wallet.createRandom();
    createdAccounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: virtualBalance
    });
  }
  console.log("Created accounts with virtual balance:", createdAccounts);
  return createdAccounts;
};
const transferFunds = async (sourcePrivateKey, destinationAddresses) => {
  const sourceWallet = createdAccounts.find((account) => account.privateKey === sourcePrivateKey);
  if (!sourceWallet) {
    throw new Error("Source wallet not found");
  }
  const sourceBalance = BigInt(sourceWallet.balance);
  const amountPerAccount = sourceBalance / BigInt(destinationAddresses.length);
  for (let destinationAddress of destinationAddresses) {
    const destinationWallet = createdAccounts.find((account) => account.address === destinationAddress);
    if (destinationWallet) {
      destinationWallet.balance = (BigInt(destinationWallet.balance) + amountPerAccount).toString();
    } else {
      console.log(`Destination address ${destinationAddress} not found in created accounts`);
    }
    sourceWallet.balance = (BigInt(sourceWallet.balance) - amountPerAccount).toString();
  }
  console.log("Funds transferred successfully!");
  console.log(`Source account balance after transfer: ${sourceWallet.balance} wei`);
  return {
    message: "Funds transferred successfully!",
    accounts: createdAccounts
  };
};
const transferRandomFunds = async () => {
  const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
  const sourceWallet = createdAccounts[sourceIndex];
  createdAccounts.forEach((account, index) => {
    if (index !== sourceIndex) {
      const transferAmount = BigInt(Math.floor(Math.random() * Number(sourceWallet.balance)));
      sourceWallet.balance = (BigInt(sourceWallet.balance) - transferAmount).toString();
      account.balance = (BigInt(account.balance) + transferAmount).toString();
    }
  });
  console.log("Random funds transferred successfully!");
  console.log(`Source address ${sourceWallet.address} new balance: ${sourceWallet.balance} wei`);
  return {
    message: "Random funds transferred successfully!",
    accounts: createdAccounts
  };
};
const transferRemainingFunds = () => {
  const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
  const recipientWallet = createdAccounts[recipientIndex];
  createdAccounts.forEach((account, index) => {
    if (index !== recipientIndex && BigInt(account.balance) > 0) {
      recipientWallet.balance = (BigInt(recipientWallet.balance) + BigInt(account.balance)).toString();
      account.balance = "0";
    }
  });
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
ipcMain.on("create-accounts", (event, numberOfAccounts) => {
  const accounts = createAccounts(numberOfAccounts);
  event.reply("accounts-created", accounts);
});
ipcMain.on("transfer-funds", async (event, sourcePrivateKey, destinationAddresses) => {
  try {
    const response = await transferFunds(sourcePrivateKey, destinationAddresses);
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
