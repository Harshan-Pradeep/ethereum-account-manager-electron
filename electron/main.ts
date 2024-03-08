import { app, BrowserWindow } from 'electron'

import path from 'node:path'
const { ipcMain } = require('electron');
const { ethers } = require('ethers');


let createdAccounts: {
  address: any; privateKey: any; balance: string; // Assign virtual balance
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


//Requirement 1
ipcMain.on('create-accounts', (event, numberOfAccounts) => {
  createdAccounts = []; // Reset the accounts array
  const virtualBalance = '5000000000000000000'; // Virtual balance in Ether

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




//Requirement 2
//Requirement 2
ipcMain.on('transfer-funds', async (event, sourcePrivateKey, destinationAddresses) => {
  console.log("sourcePrivateKey", sourcePrivateKey);
  console.log("destinationAddresses", destinationAddresses);

  try {
    const sourceWallet = createdAccounts.find(account => account.privateKey === sourcePrivateKey);
    if (!sourceWallet) {
      throw new Error("Source wallet not found");
    }

    console.log("sourceWallet", sourceWallet);

    // Use the virtual balance of the source account (converted to BigInt)
    const sourceBalance = BigInt(sourceWallet.balance);
    console.log("Source account balance:", sourceBalance, "wei");

    // Calculate the amount per account (as BigInt)
    const amountPerAccount = sourceBalance / BigInt(destinationAddresses.length);
    console.log("Amount per account:", amountPerAccount, "wei");

    for (let destinationAddress of destinationAddresses) {
      // Simulate the transaction
      console.log(`Sending transaction to ${destinationAddress} with value ${amountPerAccount} wei`);

      // Find the destination wallet in the createdAccounts array
      const destinationWallet = createdAccounts.find(account => account.address === destinationAddress);
      if (destinationWallet) {
        // Add the amountPerAccount to the destination wallet's balance (converted to string)
        destinationWallet.balance = (BigInt(destinationWallet.balance) + amountPerAccount).toString();
        console.log(`Destination address ${destinationAddress} balance after transfer: ${destinationWallet.balance} wei`);
      } else {
        console.log(`Destination address ${destinationAddress} not found in created accounts`);
      }

      // Deduct from source (simulated) (converted to string)
      sourceWallet.balance = (BigInt(sourceWallet.balance) - amountPerAccount).toString();
      console.log(`Transaction confirmed for ${destinationAddress}`);
    }

    // Update the source wallet balance (converted to string)
    console.log('Funds transferred successfully!');
    console.log(`Source account balance after transfer: ${sourceWallet.balance} wei`);
    const response = {
      message: 'Funds transferred successfully!',
      accounts: createdAccounts
    };
    event.reply('funds-transferred', response);


  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply('funds-transfer-error', response);
  }
});



// Requirement 3
ipcMain.on('transfer-random-funds', async (event) => {
  try {
    // Randomly select one account as the source
    const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
    const sourceWallet = createdAccounts[sourceIndex];

    console.log(`Selected source: ${sourceWallet.address}`);

    // Transfer random amounts to other accounts
    createdAccounts.forEach((account, index) => {
      if (index !== sourceIndex) {
        // Determine a random amount to transfer
        const transferAmount = BigInt(Math.floor(Math.random() * Number(sourceWallet.balance)));
        console.log(`Transferring ${transferAmount} wei from ${sourceWallet.address} to ${account.address}`);

        // Update balances (simulated)
        sourceWallet.balance = (BigInt(sourceWallet.balance) - transferAmount).toString();
        account.balance = (BigInt(account.balance) + transferAmount).toString();
      }
    });

    console.log('Random funds transferred successfully!');
    console.log(`Source address ${sourceWallet.address} new balance: ${sourceWallet.balance} wei`);
    console.log("Updated accounts balance:", createdAccounts);
    const response = {
      message: 'Funds transferred successfully!',
      accounts: createdAccounts
    };
    event.reply('random-funds-transferred', response);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply('random-funds-transfer-error', response);
  }
});


//Requirement 4

ipcMain.on('transfer-remaining-funds', async (event) => {
  try {
    // Randomly select one account as the recipient
    const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
    const recipientWallet = createdAccounts[recipientIndex];

    console.log(`Selected recipient: ${recipientWallet.address}`);

    // Transfer the remaining balance of other accounts to the selected account
    createdAccounts.forEach((account, index) => {
      if (index !== recipientIndex && BigInt(account.balance) > 0) {
        console.log(`Transferring ${account.balance} ETH from ${account.address} to ${recipientWallet.address}`);
        recipientWallet.balance = (BigInt(recipientWallet.balance) + BigInt(account.balance)).toString(); // Add to recipient
        account.balance = '0'; // Deduct from sender
      }
    });


    console.log('Remaining funds transferred successfully!');
    console.log(`Recipient address ${recipientWallet.address} new balance: ${recipientWallet.balance} ETH`);
    console.log("Updated accounts balance:", createdAccounts);

    const response = {
      message: 'Funds transferred successfully!',
      accounts: createdAccounts
    };
    event.reply('remaining-funds-transferred', response);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const response = {
      message: errorMessage,
      accounts: createdAccounts
    };
    event.reply('remaining-funds-transfer-error', response);
  }
});

app.whenReady().then(createWindow)
