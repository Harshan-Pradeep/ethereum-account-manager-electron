import { app, BrowserWindow } from 'electron'

import path from 'node:path'
const { ipcMain } = require('electron');
const { ethers } = require('ethers');





// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

  ipcMain.on('create-accounts', (event, numberOfAccounts) => {
    console.log(numberOfAccounts)
    //const accounts = ethereumService.createAccounts(numberOfAccounts);
    //event.reply('accounts-created', accounts);

    //const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/45428ab040a246b28ba479c3bf6f780d');
    
      let accounts = [];
      for (let i = 0; i < numberOfAccounts; i++) {
        const wallet = ethers.Wallet.createRandom();
        accounts.push({
          address: wallet.address,
          privateKey: wallet.privateKey
        });
      }
      console.log("accounts:", accounts)
      event.reply('accounts-created', accounts);

    
  });
  ipcMain.on('transfer-funds', async (event, sourcePrivateKey, destinationAddresses, amount) => {
    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/45428ab040a246b28ba479c3bf6f780d');
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
  
      event.reply('funds-transferred', 'Success');
    } catch (error) {
      if (error instanceof Error) {
        event.reply('funds-transfer-error', error.message);
      } else {
        // Handle the case where the error is not an instance of Error
        event.reply('funds-transfer-error', 'An unknown error occurred');
      }
    }
  });
  
  
  


app.whenReady().then(createWindow)
