import * as React from 'react';
import {
  transactionServices,
  useGetAccountInfo,
  useGetPendingTransactions,
  refreshAccount,
  useGetNetworkConfig
} from '@elrondnetwork/dapp-core';
import {
  Address,
  AddressValue,
  SmartContract,
  U64Value,
  ContractFunction,
  // ProxyProvider,
  Query
  // GasLimit
} from '@elrondnetwork/erdjs';
import {
  ApiNetworkProvider,
  ProxyNetworkProvider
} from '@elrondnetwork/erdjs-network-providers';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { contractAddress, pairContractAddress } from 'config';

const apiNetworkProvider = new ApiNetworkProvider(
  'https://devnet-api.elrond.com'
);

const customProxyProvider = new ProxyNetworkProvider(
  'https://devnet-gateway.elrond.com'
);

const Actions = () => {
  const account = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const { address } = account;
  console.log('network=', network);
  const [secondsLeft, setSecondsLeft] = React.useState<number>();
  const [hasPing, setHasPing] = React.useState<boolean>();
  const /*transactionSessionId*/ [, setTransactionSessionId] = React.useState<
      string | null
    >(null);

  const mount = () => {
    if (secondsLeft) {
      const interval = setInterval(() => {
        setSecondsLeft((existing) => {
          if (existing) {
            return existing - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(mount, [hasPing]);

  // React.useEffect(() => {
  //   const query = new Query({
  //     address: new Address(contractAddress),
  //     func: new ContractFunction('getTimeToPong'),
  //     args: [new AddressValue(new Address(address))]
  //   });

  //   customProxyProvider
  //     .queryContract(query)
  //     .then(({ returnData }) => {
  //       const [encoded] = returnData;
  //       switch (encoded) {
  //         case undefined:
  //           setHasPing(true);
  //           break;
  //         case '':
  //           setSecondsLeft(0);
  //           setHasPing(false);
  //           break;
  //         default: {
  //           const decoded = Buffer.from(encoded, 'base64').toString('hex');
  //           setSecondsLeft(parseInt(decoded, 16));
  //           setHasPing(false);
  //           break;
  //         }
  //       }
  //     })
  //     .catch((err) => {
  //       console.error('Unable to call VM query', err);
  //     });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [hasPendingTransactions]);

  const sendQueryToContract = async () => {
    const contractAddress = new Address(pairContractAddress);
    const contract = new SmartContract({ address: contractAddress });
    const userAddress = new Address(address);
    const getReservesAndTotalSupplyFunction = new ContractFunction(
      'getReservesAndTotalSupply'
    );

    const contractQuery = contract.createQuery({
      func: getReservesAndTotalSupplyFunction
    });

    // const contractCall = contract.call({
    //   func: new ContractFunction('getReservesAndTotalSupply'),
    //   gasLimit: new GasLimit(5000000)
    //   // args: [new AddressValue(userAddress), new U64Value(1000)]
    // });

    try {
      const response = await apiNetworkProvider.queryContract(contractQuery);
      console.log(response);
      console.log('FUNCTION=', getReservesAndTotalSupplyFunction);
    } catch (e) {
      console.log('[Contract Query ERROR]', e);
    }

    // const query = new Query({
    //   address: new Address(pairContractAddress),
    //   func: new ContractFunction('getTimeToPong'),
    //   caller: new Address(address)
    // });

    // const proxy = new ProxyProvider(network.apiAddress);
    // const proxy = new ProxyProvider(devProxy);
    // proxy
    //   .queryContract(query)
    //   .then(({ returnData }) => {
    //     const [encoded] = returnData;
    //     switch (encoded) {
    //       case undefined:
    //         setHasPing(true);
    //         break;
    //       case '':
    //         setSecondsLeft(0);
    //         setHasPing(false);
    //         break;
    //       default: {
    //         const decoded = Buffer.from(encoded, 'base64').toString('hex');
    //         setSecondsLeft(parseInt(decoded, 16));
    //         setHasPing(false);
    //         break;
    //       }
    //     }
    //   })
    //   .catch((err) => {
    //     console.error('Unable to call VM query', err);
    //   });
  };

  const { sendTransactions } = transactionServices;

  const sendPingTransaction = async () => {
    const pingTransaction = {
      value: '1000000000000000000',
      data: 'ping',
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: pingTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Ping transaction',
        errorMessage: 'An error has occured during Ping',
        successMessage: 'Ping transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendPongTransaction = async () => {
    const pongTransaction = {
      value: '0',
      data: 'pong',
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: pongTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Pong transaction',
        errorMessage: 'An error has occured during Pong',
        successMessage: 'Pong transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const pongAllowed = secondsLeft === 0 && !hasPendingTransactions;
  const notAllowedClass = pongAllowed ? '' : 'not-allowed disabled';

  const timeRemaining = moment()
    .startOf('day')
    .seconds(secondsLeft || 0)
    .format('mm:ss');

  return (
    <div className='d-flex mt-4 justify-content-center'>
      {hasPing !== undefined && (
        <>
          {hasPing && !hasPendingTransactions ? (
            <>
              <div className='action-btn' onClick={sendPingTransaction}>
                <button className='btn'>
                  <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
                </button>
                <a href='/' className='text-white text-decoration-none'>
                  Ping
                </a>
              </div>
            </>
          ) : (
            <>
              <div className='d-flex flex-column'>
                <div
                  {...{
                    className: `action-btn ${notAllowedClass}`,
                    ...(pongAllowed ? { onClick: sendPongTransaction } : {})
                  }}
                >
                  <button className={`btn ${notAllowedClass}`}>
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className='text-primary'
                    />
                  </button>
                  <span className='text-white'>
                    {pongAllowed ? (
                      <a href='/' className='text-white text-decoration-none'>
                        Pong
                      </a>
                    ) : (
                      <>Pong</>
                    )}
                  </span>
                </div>
                {!pongAllowed && !hasPendingTransactions && (
                  <span className='opacity-6 text-white'>
                    {timeRemaining} until able to Pong
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
      <div className='action-btn' onClick={sendQueryToContract}>
        <button className='btn'>
          <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
        </button>
        <a href='/' className='text-white text-decoration-none'>
          Query contract
        </a>
      </div>
    </div>
  );
};

export default Actions;
