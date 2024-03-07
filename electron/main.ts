import { app, BrowserWindow } from 'electron'

import path from 'node:path'
const { ipcMain } = require('electron');
const { ethers } = require('ethers');


let createdAccounts: {
  address: any; privateKey: any; balance: number; // Assign virtual balance
}[] = [];



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
  createdAccounts = []; // Reset the accounts array
  const virtualBalance = 5; // Virtual balance in Ether

  for (let i = 0; i < numberOfAccounts; i++) {
    const wallet = ethers.Wallet.createRandom();
    createdAccounts.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: virtualBalance // Assign virtual balance
    });
  }

  console.log("Created accounts with virtual balance:", createdAccounts);
  event.reply('accounts-created', createdAccounts);
});


  
  

ipcMain.on('transfer-funds', async (event, sourcePrivateKey, destinationAddresses) => {
  console.log("sourcePrivateKey", sourcePrivateKey);
  console.log("destinationAddresses", destinationAddresses);

  try {
    const sourceWallet = createdAccounts.find(account => account.privateKey === sourcePrivateKey);
    if (!sourceWallet) {
      throw new Error("Source wallet not found");
    }

    console.log("sourceWallet", sourceWallet);

    // Use the virtual balance of the source account
    const sourceBalance = ethers.parseEther(sourceWallet.balance.toString());
    console.log("Source account balance:", ethers.formatEther(sourceBalance), "ETH");

    // Calculate the amount per account
    const amountPerAccountNumber = parseFloat(ethers.formatEther(sourceBalance)) / destinationAddresses.length;
    const amountPerAccount = ethers.parseEther(amountPerAccountNumber.toString());
    console.log("Amount per account:", ethers.formatEther(amountPerAccount), "ETH");

    let remainingBalance = sourceBalance; // Initialize remaining balance

    for (let destinationAddress of destinationAddresses) {
      // Simulate the transaction
      console.log(`Sending transaction to ${destinationAddress} with value ${ethers.formatEther(amountPerAccount)} ETH`);
    
      // Find the destination wallet in the createdAccounts array
      const destinationWallet = createdAccounts.find(account => account.address === destinationAddress);
      if (destinationWallet) {
        // Add the amountPerAccount to the destination wallet's balance
        destinationWallet.balance += parseFloat(ethers.formatEther(amountPerAccount));
        console.log(`Destination address ${destinationAddress} balance after transfer: ${destinationWallet.balance} ETH`);
      } else {
        console.log(`Destination address ${destinationAddress} not found in created accounts`);
      }
    
      // Deduct from source (simulated)
      remainingBalance = remainingBalance - (amountPerAccount);
      console.log(`Transaction confirmed for ${destinationAddress}`);
    }
    
    // Update the source wallet balance
    sourceWallet.balance = parseFloat(ethers.formatEther(remainingBalance));
    console.log('Funds transferred successfully!');
    console.log(`Source account balance after transfer: ${sourceWallet.balance} ETH`);
    

    // Update the source wallet balance
    sourceWallet.balance = ethers.formatEther(remainingBalance);
    console.log('Funds transferred successfully!');
    console.log(`Source account balance after transfer: ${sourceWallet.balance} ETH`);
    console.log("accounts balance", createdAccounts)
    event.reply('funds-transferred', 'Success');

  } catch (error) {
    console.error('Error occurred:', error);
    if (error instanceof Error) {
      event.reply('funds-transfer-error', error.message);
    } else {
      event.reply('funds-transfer-error', 'An unknown error occurred');
    }
  }
});






  
  
  
  
  
  


app.whenReady().then(createWindow)
