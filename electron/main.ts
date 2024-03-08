import { app, BrowserWindow, dialog } from 'electron'

import path from 'node:path'
import { createAccounts, transferFunds, transferRandomFunds, transferRemainingFunds } from './accountHandlers';
const { ipcMain } = require('electron');

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
    width: 1000,
    height: 1600,
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
  const accounts = createAccounts(numberOfAccounts);
  event.reply('accounts-created', accounts);
});

//Requirement 2

ipcMain.on('transfer-funds', async (event, sourcePrivateKey, destinationAddresses) => {
  try {
    const response = await transferFunds(sourcePrivateKey, destinationAddresses);

    dialog.showMessageBox({
      type: 'info',
      title: 'Transfer Random Funds',
      message: response.message
    });

    event.reply('funds-transferred', response);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    dialog.showMessageBox({
      type: 'error',
      title: 'Transfer Random Funds Error',
      message: errorMessage
    });
  }
});

// Requirement 3

ipcMain.on('transfer-random-funds', async (event) => {
  try {
    const response = await transferRandomFunds();
    console.log(response.message);
    console.log("Updated accounts balance:", response.accounts);

    dialog.showMessageBox({
      type: 'info',
      title: 'Transfer Random Funds',
      message: response.message
    });

    event.reply('random-funds-transferred', response);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error occurred:', errorMessage);

    dialog.showMessageBox({
      type: 'error',
      title: 'Transfer Random Funds Error',
      message: errorMessage
    });
  }
});

//Requirement 4

ipcMain.on('transfer-remaining-funds', async (event) => {
  try {
    const response = transferRemainingFunds();

    dialog.showMessageBox({
      type: 'info',
      title: 'Transfer Random Funds',
      message: response.message
    });

    event.reply('remaining-funds-transferred', response);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    dialog.showMessageBox({
      type: 'error',
      title: 'Transfer Random Funds Error',
      message: errorMessage
    });
  }
});

app.whenReady().then(createWindow)
