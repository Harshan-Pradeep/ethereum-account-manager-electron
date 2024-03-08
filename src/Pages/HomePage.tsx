import React, { useState, useEffect } from 'react';
import AccountTable from '../Components/AccountTable';
import CreateAccountsComponent from '../Components/CreateAccountsComponent';
import TransferFundsComponent from '../Components/TransferFundsComponent';
import RandomTransferComponent from '../Components/RandomTransferComponent';
import ConsolidateBalanceComponent from '../Components/ConsolidateBalanceComponent';


const HomePage = () => {


  return (
    <>
      <AccountTable />
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <CreateAccountsComponent />
          <TransferFundsComponent />
        </div>

        <div>
          <RandomTransferComponent />
          <ConsolidateBalanceComponent />
        </div>
      </div>



    </>

  );
};

export default HomePage;
