import * as React from 'react';
import {
  transactionServices,
  sendTransactions,
  useGetAccountInfo,
  useGetPendingTransactions,
  refreshAccount,
  useGetNetworkConfig,
  TokenOptionType
} from '@elrondnetwork/dapp-core';
import {
  Address,
  // AddressValue,
  // SmartContract,
  // U32Value,
  // Interaction,
  // U64Value,
  BalanceBuilder,
  ContractFunction,
  ProxyProvider,
  // ResultsParser,
  Account,
  Transaction,
  // Transaction,
  // TransactionPayload,
  // TokenPayment
  Query,
  createBalanceBuilder
  // GasLimit
} from '@elrondnetwork/erdjs';
// import {
//   ApiNetworkProvider,
//   ContractQueryResponse,
//   ProxyNetworkProvider
// } from '@elrondnetwork/erdjs-network-providers';
import {
  faArrowUp,
  faHandHoldingUsd,
  faMoneyCheck
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type TokenType = {
  name: string;
  id: { dev?: string; test?: string; main?: string };
  decimals: number;
};

// const ESDTokensData =

const USDT_Token: TokenType = {
  name: 'USDT',
  id: { test: 'USDT-7d8186' },
  decimals: 6
};

const USDC_Token: TokenType = {
  name: 'USDC',
  id: { test: 'USDC-780dd8' },
  decimals: 6
};

const getTokenData = (id: string, chainId: 'test' | 'dev' | 'main') => {
  switch (chainId) {
    case 'test':
      return 1;
    case 'dev':
      return 0;
    case 'main':
      return 2;
    default:
      return 1;
  }
};

import { crowdFundContractAddress } from 'config';

const buildTokenVlue = (amount: string, decimals: number): string => {
  const realAmount = parseFloat(amount) * 10 ** decimals;
  const hexEncoded = Math.round(realAmount).toString(16);
  // The prepended zero byte makes sure the contract interprets it as positive. (https://docs.elrond.com/developers/mandos-reference/values-simple/#empty-value)
  const sign = '00';
  return `0x${sign}${hexEncoded}`;
};

const toHexEncoded = (value: string): string =>
  Buffer.from(value).toString('hex');

const buildTokenTransferData = ({
  method,
  token,
  value,
  decimals
}: {
  method: string;
  token: string;
  value: string;
  decimals: number;
}): string => {
  const txTokenType = 'ESDTTransfer';
  const encodedTokenId = toHexEncoded(token);
  const encodedAmount = buildTokenVlue(value, decimals);
  const methodCall = toHexEncoded(method);

  return `${txTokenType}@${encodedTokenId}@${encodedAmount}@${methodCall}`;
};

const Actions = () => {
  const account = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const { address } = account;
  const appSenderAddressObj = new Address(address);
  const appSenderAccount = new Account(appSenderAddressObj);

  console.log('network=', network);

  const /*transactionSessionId*/ [, setTransactionSessionId] = React.useState<
      string | null
    >(null);

  const sendQueryToContract = async () => {
    const crowdfundingContractAddrObj = new Address(crowdFundContractAddress);
    const query = new Query({
      address: crowdfundingContractAddrObj,
      func: new ContractFunction('getCurrentFunds')
    });
    const proxy = new ProxyProvider(network.apiAddress);

    proxy
      .queryContract(query)
      .then(({ returnData }) => {
        console.log(returnData);

        const [encoded] = returnData;
        if (encoded) {
          const decodedHex = Buffer.from(encoded, 'base64').toString('hex');
          console.log(
            'Decoded Data getCurrentFunds=',
            'hex=',
            decodedHex,
            'dec=',
            parseInt(decodedHex, 16)
          );
        }
      })
      .catch((err) => {
        console.error('Unable to call query', err);
      });
  };

  const sendTokenFunds = async () => {
    const tokenTransaction = {
      value: '0',
      data: buildTokenTransferData({
        method: 'fund',
        token: 'USDT-7d8186',
        value: '10',
        decimals: 6
      }),
      receiver: crowdFundContractAddress
    };

    await refreshAccount();

    try {
      const { sessionId, error } = await sendTransactions({
        transactions: tokenTransaction,
        transactionsDisplayInfo: {
          errorMessage: 'ERROR: Tx failed',
          successMessage: 'Successful Tx',
          processingMessage: 'TX in progress',
          submittedMessage: 'TX submitted',
          transactionDuration: 'Duration in ms:' // (optional, default to null) custom message for toasts texts;
        }
      });

      // tx.applySignature();
      console.log('TX Result', sessionId, error);
    } catch (e) {
      console.log('[ERROR] Payable TX failed', e);
    }
  };

  const fundContract = async () => {
    const fundTransaction = {
      value: '10000000000000000',
      data: 'fund',
      receiver: crowdFundContractAddress
    };

    await refreshAccount();

    try {
      const { sessionId, error } = await sendTransactions({
        transactions: fundTransaction,
        transactionsDisplayInfo: {
          errorMessage: 'ERROR: Tx failed',
          successMessage: 'Successful Tx',
          processingMessage: 'TX in progress',
          submittedMessage: 'TX submitted',
          transactionDuration: 'Duration in ms:' // (optional, default to null) custom message for toasts texts;
        }
      });

      // tx.applySignature();
      console.log('TX Result', sessionId, error);
    } catch (e) {
      console.log('[ERROR] Payable TX failed', e);
    }
  };

  const claimFunds = async () => {
    const fundTransaction = {
      value: '0',
      data: 'claim',
      receiver: crowdFundContractAddress
    };

    await refreshAccount();

    try {
      const { sessionId, error } = await sendTransactions({
        transactions: fundTransaction,
        transactionsDisplayInfo: {
          errorMessage: 'ERROR: Tx failed',
          successMessage: 'Successful Tx',
          processingMessage: 'TX in progress',
          submittedMessage: 'TX submitted',
          transactionDuration: 'Duration in ms:' // (optional, default to null) custom message for toasts texts;
        }
      });

      // tx.applySignature();
      console.log('TX Result', sessionId, error);
    } catch (e) {
      console.log('[ERROR] Payable TX failed', e);
    }
  };

  const sendDemoTransaction = async () => {
    const fundTransaction = {
      value: '1000000000000000000',
      data: 'fund',
      receiver: crowdFundContractAddress
    };
    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: fundTransaction,
      transactionsDisplayInfo: {
        errorMessage: 'ERROR: Tx failed',
        successMessage: 'Congrats! Funds sent to the crowdfunding contract',
        processingMessage: 'Funds send is being processed',
        submittedMessage: 'Tx submitted',
        transactionDuration: 'Duration in ms:'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  return (
    <div className='d-flex mt-4 justify-content-center'>
      <div className='action-btn' onClick={sendQueryToContract}>
        <button className='btn'>
          <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
        </button>
        <span className='text-white text-decoration-none'>Query contract</span>
      </div>
      <div className='action-btn' onClick={fundContract}>
        <button className='btn'>
          <FontAwesomeIcon icon={faHandHoldingUsd} className='text-primary' />
        </button>
        <span className='text-white text-decoration-none'>Send Funds</span>
      </div>
      <div className='action-btn' onClick={sendTokenFunds}>
        <button className='btn'>
          <FontAwesomeIcon icon={faHandHoldingUsd} className='text-primary' />
        </button>
        <span className='text-white text-decoration-none'>
          Send Fund Tokens
        </span>
      </div>
      <div className='action-btn' onClick={claimFunds}>
        <button className='btn'>
          <FontAwesomeIcon icon={faMoneyCheck} className='text-primary' />
        </button>
        <span className='text-white text-decoration-none'>Claim Funds</span>
      </div>
    </div>
  );
};

export default Actions;
