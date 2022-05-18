import React from 'react';
import {
  DappUI,
  useGetLoginInfo,
  loginServices
} from '@elrondnetwork/dapp-core';
import { routeNames } from 'routes';

export const UnlockRoute: () => JSX.Element = () => {
  const {
    ExtensionLoginButton,
    WebWalletLoginButton,
    LedgerLoginButton,
    WalletConnectLoginButton
  } = DappUI;
  const { isLoggedIn } = useGetLoginInfo();
  const { useExtensionLogin } = loginServices;
  const [triggerExtensionLogin, { error, loginFailed, isLoading }] =
    useExtensionLogin({ callbackRoute: '/dashboard' });
  React.useEffect(() => {
    if (isLoggedIn) {
      window.location.href = routeNames.dashboard;
    }
  }, [isLoggedIn]);

  return (
    <div className='home d-flex flex-fill align-items-center'>
      <div className='m-auto' data-testid='unlockPage'>
        <div className='card my-4 text-center'>
          <div className='card-body py-4 px-2 px-sm-2 mx-lg-4'>
            <h4 className='mb-4'>Custom Login</h4>
            <p className='mb-4'>pick a login method</p>

            <ExtensionLoginButton
              callbackRoute={routeNames.dashboard}
              loginButtonText={'Extension'}
            />
            <WebWalletLoginButton
              callbackRoute={routeNames.dashboard}
              loginButtonText={'Web wallet'}
            />
            {/* <LedgerLoginButton
              loginButtonText={'Ledger'}
              callbackRoute={routeNames.dashboard}
              className={'test-class_name'}
            /> */}
            {/* <WalletConnectLoginButton
              callbackRoute={routeNames.dashboard}
              loginButtonText={'Maiar'}
            />
             */}
            <span>
              <button
                style={{
                  // width: '100px',
                  height: '20px',
                  padding: '20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'darkgray',
                  borderRadius: '10px',
                  border: '0px'
                }}
                onClick={triggerExtensionLogin}
              >
                Custom Extension Button
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockRoute;
