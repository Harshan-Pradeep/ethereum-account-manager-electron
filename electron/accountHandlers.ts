

const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.JsonRpcProvider);
let senderBalance: any;
const senderPrivateKey = process.env.SenderPrivateKey; 
export let createdAccounts: {
    address: string;
    privateKey: string;
    balance: string
}[] = [];

export const getBalanceSourceAccount = async () => {
    const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
    const balance = await provider.getBalance(senderWallet.address);
    senderBalance = ethers.formatEther(balance);
    console.log(`Balance of sender before transaction: ${senderBalance} ETH`);

}
async function sendETHMultiple(recipientAddresses: string[], amount: string, sourceAddress: string, sourcePrivateKey: string) {
    // Create a wallet instance from the source private key
    const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);

    for (const recipientAddress of recipientAddresses) {
        // Define the transaction details for each recipient
        const tx = {
            to: recipientAddress,
            // Convert the amount to Wei (1 ETH = 10^18 Wei)
            value: ethers.parseEther(amount),
            // Set a gas limit for the transaction
            gasLimit: 100000, // 100,000 gas
        };

        // Sign and send the transaction
        const transaction = await sourceWallet.sendTransaction(tx);
        console.log(`Transaction hash for ${recipientAddress}: ${transaction.hash}`);

        // Wait for the transaction to be mined
        await transaction.wait();
        console.log(`Transaction to ${recipientAddress} confirmed!`);
    }


}


export const createAccounts = async (numberOfAccounts: number): Promise<{ address: string; privateKey: string; }[]> => {
    createdAccounts = [];

    // Create the accounts
    for (let i = 0; i < numberOfAccounts; i++) {
        const wallet = ethers.Wallet.createRandom();
        createdAccounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: '0'
        });
    }

    console.log("Created accounts:", createdAccounts);

    return createdAccounts;
};


export const transferFunds = async () => {

    // Get the balance of the source account

    await getBalanceSourceAccount();
    const sourceBalance = parseFloat(senderBalance);

    // Estimate the gas cost for a single transaction
    const gasPrice = (await provider.getFeeData()).gasPrice;
    const gasLimit = BigInt(21000);
    const txCost = parseFloat(ethers.formatUnits(gasPrice * gasLimit, 'ether'));

    // Calculate the total cost for all transactions
    const totalTxCost = txCost * createAccounts.length;

    if (sourceBalance < totalTxCost) {
        throw new Error('Insufficient funds to cover the transaction costs.');
    }

    // Calculate the amount to send to each account, accounting for gas fees
    const amountToSend = ((sourceBalance - totalTxCost) / (createdAccounts.length)).toFixed(6);

    // Extract just the addresses from the createdAccounts array
    const recipientAddresses = createdAccounts.map(account => account.address);


    try {
        await sendETHMultiple(
            recipientAddresses,
            amountToSend.toString(),
            '0xE6798FCa40F9cD945e06a0fFbB12e4e53a30c400',
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
            message: 'Funds transferred successfully!',
            accounts: createdAccounts
        };


    }
};

export const transferRandomFunds = async () => {
    // Randomly select one account as the source
    const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
    const sourceWallet = createdAccounts[sourceIndex];

    const numberOfAccounts = createdAccounts.length;
    // Transfer random amounts to other accounts
    for (let i = 0; i < createdAccounts.length; i++) {
        if (i !== sourceIndex) {
            let recipientWallet = createdAccounts[i];

            let transferAmount = parseFloat((Math.random() * (sourceWallet.balance - buffer)).toFixed(6));

            console.log("transferAmount", transferAmount)

            try {


                await sendETH(sourceWallet.privateKey, recipientWallet, transferAmount)

                console.log(`Transaction successful! New balance of ${sourceWallet.address}: ${sourceWallet.balance} ETH`);
                console.log(`New balance of ${recipientWallet.address}: ${recipientWallet.balance} ETH`);
            } catch (error) {
                console.error(`Transaction failed: ${error.message}`);
            }
        }
    }

    return {
        message: 'Random funds transferred successfully!',
        accounts: createdAccounts
    };
};


export const transferRemainingFunds = async () => {
    // Randomly select one account as the recipient
    const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
    const recipientWallet = createdAccounts[recipientIndex];
    const buffer = 0.0001;
    for (let i = 0; i < createdAccounts.length; i++) {
        if (i !== recipientIndex) {
            const sourceWallet = createdAccounts[i];
            const transferAmount = sourceWallet.balance - buffer;
            console.log("transferAmount", transferAmount)

            try {

                await sendETH(sourceWallet.privateKey, recipientWallet, transferAmount)

                console.log(`Transaction successful! New balance of ${sourceWallet.address}: ${sourceWallet.balance} ETH`);
                console.log(`New balance of ${recipientWallet.address}: ${recipientWallet.balance} ETH`);
            } catch (error) {
                console.error(`Transaction failed: ${error.message}`);
            }
        }
    }

    console.log('Remaining funds transferred successfully!');
    console.log(`Recipient address ${recipientWallet.address} new balance: ${recipientWallet.balance} ETH`);
    return {
        message: 'Remaining funds transferred successfully!',
        accounts: createdAccounts
    };
};