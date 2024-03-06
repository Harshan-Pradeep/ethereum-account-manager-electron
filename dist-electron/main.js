"use strict";
const electron = require("electron");
const path = require("node:path");
const { ipcMain } = require("electron");
const { ethers } = require("ethers");
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
  console.log(numberOfAccounts);
  let accounts = [];
  for (let i = 0; i < numberOfAccounts; i++) {
    const wallet = ethers.Wallet.createRandom();
    accounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey
    });
  }
  console.log("accounts:", accounts);
  event.reply("accounts-created", accounts);
});
ipcMain.on("transfer-funds", async (event, sourcePrivateKey, destinationAddresses, amount) => {
  try {
    const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/45428ab040a246b28ba479c3bf6f780d");
    const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);
    const totalAmount = ethers.utils.parseEther(amount.toString());
    const amountPerAccount = totalAmount.div(ethers.BigNumber.from(destinationAddresses.length));
    for (let address of destinationAddresses) {
      const transaction = {
        to: address,
        value: amountPerAccount.toString()
      };
      await sourceWallet.sendTransaction(transaction);
    }
    event.reply("funds-transferred", "Success");
  } catch (error) {
    if (error instanceof Error) {
      event.reply("funds-transfer-error", error.message);
    } else {
      event.reply("funds-transfer-error", "An unknown error occurred");
    }
  }
});
electron.app.whenReady().then(createWindow);
