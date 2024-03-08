const { ethers } = require('ethers');

export let createdAccounts: {
    address: string;
    privateKey: string;
    balance: string;
}[] = [];

export const createAccounts = (numberOfAccounts: number): typeof createdAccounts => {
    createdAccounts = [];
    const virtualBalance = '5000000000000000000'; // Virtual balance in wei (5 ETH)

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

export const transferFunds = async (
    sourcePrivateKey: string,
    destinationAddresses: Array<string>
) => {
    const sourceWallet = createdAccounts.find(account => account.privateKey === sourcePrivateKey);
    if (!sourceWallet) {
        throw new Error("Source wallet not found");
    }

    const sourceBalance = BigInt(sourceWallet.balance);
    const amountPerAccount = sourceBalance / BigInt(destinationAddresses.length);

    for (let destinationAddress of destinationAddresses) {
        const destinationWallet = createdAccounts.find(account => account.address === destinationAddress);
        if (destinationWallet) {
            destinationWallet.balance = (BigInt(destinationWallet.balance) + amountPerAccount).toString();
        } else {
            console.log(`Destination address ${destinationAddress} not found in created accounts`);
        }

        sourceWallet.balance = (BigInt(sourceWallet.balance) - amountPerAccount).toString();
    }

    console.log('Funds transferred successfully!');
    console.log(`Source account balance after transfer: ${sourceWallet.balance} wei`);

    return {
        message: 'Funds transferred successfully!',
        accounts: createdAccounts
    };
};

export const transferRandomFunds = async (
) => {
    // Randomly select one account as the source
    const sourceIndex = Math.floor(Math.random() * createdAccounts.length);
    const sourceWallet = createdAccounts[sourceIndex];

    // Transfer random amounts to other accounts
    createdAccounts.forEach((account, index) => {
        if (index !== sourceIndex) {
            const transferAmount = BigInt(Math.floor(Math.random() * Number(sourceWallet.balance)));
            sourceWallet.balance = (BigInt(sourceWallet.balance) - transferAmount).toString();
            account.balance = (BigInt(account.balance) + transferAmount).toString();
        }
    });

    console.log('Random funds transferred successfully!');
    console.log(`Source address ${sourceWallet.address} new balance: ${sourceWallet.balance} wei`);
    return {
        message: 'Random funds transferred successfully!',
        accounts: createdAccounts
    };
};

export const transferRemainingFunds = () => {
    // Randomly select one account as the recipient
    const recipientIndex = Math.floor(Math.random() * createdAccounts.length);
    const recipientWallet = createdAccounts[recipientIndex];

    // Transfer the remaining balance of other accounts to the selected account
    createdAccounts.forEach((account, index) => {
        if (index !== recipientIndex && BigInt(account.balance) > 0) {
            recipientWallet.balance = (BigInt(recipientWallet.balance) + BigInt(account.balance)).toString(); // Add to recipient
            account.balance = '0'; // Deduct from sender
        }
    });

    console.log('Remaining funds transferred successfully!');
    console.log(`Recipient address ${recipientWallet.address} new balance: ${recipientWallet.balance} ETH`);
    return {
        message: 'Remaining funds transferred successfully!',
        accounts: createdAccounts
    };
};