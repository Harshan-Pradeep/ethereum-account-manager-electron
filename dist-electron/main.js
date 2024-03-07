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
  const virtualBalance = 5;
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
    const sourceBalance = ethers.parseEther(sourceWallet.balance.toString());
    console.log("Source account balance:", ethers.formatEther(sourceBalance), "ETH");
    const amountPerAccountNumber = parseFloat(ethers.formatEther(sourceBalance)) / destinationAddresses.length;
    const amountPerAccount = ethers.parseEther(amountPerAccountNumber.toString());
    console.log("Amount per account:", ethers.formatEther(amountPerAccount), "ETH");
    let remainingBalance = sourceBalance;
    for (let destinationAddress of destinationAddresses) {
      console.log(`Sending transaction to ${destinationAddress} with value ${ethers.formatEther(amountPerAccount)} ETH`);
      const destinationWallet = createdAccounts.find((account) => account.address === destinationAddress);
      if (destinationWallet) {
        destinationWallet.balance += parseFloat(ethers.formatEther(amountPerAccount));
        console.log(`Destination address ${destinationAddress} balance after transfer: ${destinationWallet.balance} ETH`);
      } else {
        console.log(`Destination address ${destinationAddress} not found in created accounts`);
      }
      remainingBalance = remainingBalance - amountPerAccount;
      console.log(`Transaction confirmed for ${destinationAddress}`);
    }
    sourceWallet.balance = parseFloat(ethers.formatEther(remainingBalance));
    console.log("Funds transferred successfully!");
    console.log(`Source account balance after transfer: ${sourceWallet.balance} ETH`);
    sourceWallet.balance = ethers.formatEther(remainingBalance);
    console.log("Funds transferred successfully!");
    console.log(`Source account balance after transfer: ${sourceWallet.balance} ETH`);
    console.log("accounts balance", createdAccounts);
    event.reply("funds-transferred", "Success");
  } catch (error) {
    console.error("Error occurred:", error);
    if (error instanceof Error) {
      event.reply("funds-transfer-error", error.message);
    } else {
      event.reply("funds-transfer-error", "An unknown error occurred");
    }
  }
});
electron.app.whenReady().then(createWindow);
