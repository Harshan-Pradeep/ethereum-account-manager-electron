"use strict";
const electron = require("electron");
const path = require("node:path");
const { ipcMain } = require("electron");
const { ethers } = require("ethers");
let createdAccounts = [];
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
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
  createdAccounts = [];
  const virtualBalance = "5000000000000000000";
  for (let i = 0; i < numberOfAccounts; i++) {
    const wallet = ethers.Wallet.createRandom();
    createdAccounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: virtualBalance
      // Assign virtual balance
    });
  }
  console.log("Created accounts with virtual balance:", createdAccounts);
  event.reply("accounts-created", createdAccounts);
});
ipcMain.on("transfer-funds", async (event, sourcePrivateKey, destinationAddresses) => {
  console.log("sourcePrivateKey", sourcePrivateKey);
  console.log("destinationAddresses", destinationAddresses);
  try {
    const sourceWallet = createdAccounts.find((account) => account.privateKey === sourcePrivateKey);
    if (!sourceWallet) {
      throw new Error("Source wallet not found");
    }
    console.log("sourceWallet", sourceWallet);
    const sourceBalance = BigInt(sourceWallet.balance);
    console.log("Source account balance:", sourceBalance, "wei");
    const amountPerAccount = sourceBalance / BigInt(destinationAddresses.length);
    console.log("Amount per account:", amountPerAccount, "wei");
    for (let destinationAddress of destinationAddresses) {
      console.log(`Sending transaction to ${destinationAddress} with value ${amountPerAccount} wei`);
      const destinationWallet = createdAccounts.find((account) => account.address === destinationAddress);
      if (destinationWallet) {
        destinationWallet.balance = (BigInt(destinationWallet.balance) + amountPerAccount).toString();
        console.log(`Destination address ${destinationAddress} balance after transfer: ${destinationWallet.balance} wei`);
      } else {
        console.log(`Destination address ${destinationAddress} not found in created accounts`);
      }
      sourceWallet.balance = (BigInt(sourceWallet.balance) - amountPerAccount).toString();
      console.log(`Transaction confirmed for ${destinationAddress}`);
    }
    console.log("Funds transferred successfully!");
    console.log(`Source account balance after transfer: ${sourceWallet.balance} wei`);
    const response = {
      message: "Funds transferred successfully!",
      accounts: createdAccounts
    };
    event.reply("funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply("funds-transfer-error", response);
  }
});
ipcMain.on("transfer-random-funds", async (event) => {
  try {
    const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
    const sourceWallet = createdAccounts[sourceIndex];
    console.log(`Selected source: ${sourceWallet.address}`);
    createdAccounts.forEach((account, index) => {
      if (index !== sourceIndex) {
        const transferAmount = BigInt(Math.floor(Math.random() * Number(sourceWallet.balance)));
        console.log(`Transferring ${transferAmount} wei from ${sourceWallet.address} to ${account.address}`);
        sourceWallet.balance = (BigInt(sourceWallet.balance) - transferAmount).toString();
        account.balance = (BigInt(account.balance) + transferAmount).toString();
      }
    });
    console.log("Random funds transferred successfully!");
    console.log(`Source address ${sourceWallet.address} new balance: ${sourceWallet.balance} wei`);
    console.log("Updated accounts balance:", createdAccounts);
    const response = {
      message: "Funds transferred successfully!",
      accounts: createdAccounts
    };
    event.reply("random-funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply("random-funds-transfer-error", response);
  }
});
ipcMain.on("transfer-remaining-funds", async (event) => {
  try {
    const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
    const recipientWallet = createdAccounts[recipientIndex];
    console.log(`Selected recipient: ${recipientWallet.address}`);
    createdAccounts.forEach((account, index) => {
      if (index !== recipientIndex && BigInt(account.balance) > 0) {
        console.log(`Transferring ${account.balance} ETH from ${account.address} to ${recipientWallet.address}`);
        recipientWallet.balance = (BigInt(recipientWallet.balance) + BigInt(account.balance)).toString();
        account.balance = "0";
      }
    });
    console.log("Remaining funds transferred successfully!");
    console.log(`Recipient address ${recipientWallet.address} new balance: ${recipientWallet.balance} ETH`);
    console.log("Updated accounts balance:", createdAccounts);
    const response = {
      message: "Funds transferred successfully!",
      accounts: createdAccounts
    };
    event.reply("remaining-funds-transferred", response);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply("remaining-funds-transfer-error", response);
  }
});
electron.app.whenReady().then(createWindow);
