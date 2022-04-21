import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { ModalWallet } from 'components/base/Modal'
import { ProfileMenuBadge, ProfileMenuDropdown } from 'components/base/ProfileMenu'
import Button from 'components/ui/Button'

import { computeCaps } from 'utils/strings'
import { useApp } from 'redux/hooks'
import { SigningCosmWasmClient } from 'secretjs'

const FloatingHeader: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalWalletExpanded, setIsModalWalletExpanded] = useState(false)
  const [isProfileMenuExpanded, setIsProfileMenuExpanded] = useState(false)

  const { user } = useApp()
  const wallet = async () => {
    const chainId = 'pulsar-2';

    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.

    if (!window.getOfflineSigner || !window.keplr) {
        // alert("Please install keplr extension");
        setIsModalWalletExpanded(true);
        setIsExpanded(false);
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Setup Secret Testnet (not needed on mainnet)
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // cosmoshub-3 is integrated to Keplr so the code should return without errors.
                // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    chainId: 'pulsar-2',
                    chainName: 'pulsar-2 Testnet',
                    rpc: 'https://rpc.pulsar.griptapejs.com/',
                    rest: 'http://testnet.securesecrets.org:1317/',
                    bip44: {
                        coinType: 529,
                    },
                    coinType: 529,
                    stakeCurrency: {
                        coinDenom: 'SCRT',
                        coinMinimalDenom: 'uscrt',
                        coinDecimals: 6,
                    },
                    bech32Config: {
                        bech32PrefixAccAddr: 'pulsar',
                        bech32PrefixAccPub: 'pulsarpub',
                        bech32PrefixValAddr: 'pulsarvaloper',
                        bech32PrefixValPub: 'pulsarvaloperpub',
                        bech32PrefixConsAddr: 'pulsarvalcons',
                        bech32PrefixConsPub: 'pulsarvalconspub',
                    },
                    currencies: [
                        {
                            coinDenom: 'SCRT',
                            coinMinimalDenom: 'uscrt',
                            coinDecimals: 6,
                        },
                    ],
                    feeCurrencies: [
                        {
                            coinDenom: 'SCRT',
                            coinMinimalDenom: 'uscrt',
                            coinDecimals: 6,
                        },
                    ],
                    gasPriceStep: {
                        low: 0.1,
                        average: 0.25,
                        high: 0.4,
                    },
                    features: ['secretwasm'],
                });

                // This method will ask the user whether or not to allow access if they haven't visited this website.
                // Also, it will request user to unlock the wallet if the wallet is locked.
                // If you don't request enabling before usage, there is no guarantee that other methods will work.
                await window.keplr.enable(chainId);

                // @ts-ignore
                const keplrOfflineSigner = window.getOfflineSigner(chainId);
                const accounts = await keplrOfflineSigner.getAccounts();                
                
                const address = accounts[0].address;
                console.log("address:"+address);

                const cosmJS = new SigningCosmWasmClient(
                    'http://testnet.securesecrets.org:1317/',
                    address,
                    keplrOfflineSigner,
                    window.getEnigmaUtils(chainId),
                    {
                        init: {
                            amount: [{ amount: '300000', denom: 'uscrt' }],
                            gas: '300000',
                        },
                        exec: {
                            amount: [{ amount: '300000', denom: 'uscrt' }],
                            gas: '300000',
                        },
                    },
                );
                const account = await cosmJS.getAccount(address);

                console.log(account);
                
                // Show balance if available
                if (account) {
                  // For testing this assumes a new account with only uscrt in the list of balances
                  console.log("balance:"+"`${getScrt(account)}`");
                } else {
                    console.log("balance: 0 USCRT");
                }

            } catch (error) {
                console.error(error)
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }
    
  }

  return (
    <>
      <SHeaderContainer isExpanded={isExpanded}>
        {isExpanded && (
          <SExpandedHeaderWrapper>
            <Link href="/create" passHref>
              <SLink>Create</SLink>
            </Link>
            <Link href="/explore" passHref>
              <SLink>Explore</SLink>
            </Link>
            <Link href="/faq" passHref>
              <SLink>How it works</SLink>
            </Link>
          </SExpandedHeaderWrapper>
        )}
        <SWrapper>
          <SBurgerContainer onClick={() => setIsExpanded(!isExpanded)}>
            <SBurgerBox>
              <SBurgerInner isExpanded={isExpanded} />
            </SBurgerBox>
          </SBurgerContainer>
          {user === undefined || user === null || user._id === '' ? (
            <Button
              color="invertedContrast"
              onClick={wallet}
              size="medium"
              text="Connect"
              variant="contained"
            />
          ) : (
            <SProfileMenuBadge
              onClick={() => setIsProfileMenuExpanded((prevState) => !prevState)}
              tokenAmount={user?.capsAmount ? computeCaps(Number(user.capsAmount)) : 0}
              tokenSymbol="SCRT"
              user={user}
            />
          )}
        </SWrapper>
        {user && isProfileMenuExpanded && (
          <SProfileMenuDropdown onClose={() => setIsProfileMenuExpanded(false)} user={user} />
        )}
      </SHeaderContainer>
      {isModalWalletExpanded && <ModalWallet setExpanded={setIsModalWalletExpanded} />}
    </>
  )
}

const SHeaderContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  width: 80%;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border-radius: ${({ isExpanded }) => (isExpanded ? '2.4rem' : '4rem')};
  position: fixed;
  z-index: 100;
  bottom: 5.6rem;
  right: 10%;
  padding: ${({ isExpanded }) => (isExpanded ? '1.6rem' : '1.2rem')};
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 28rem;
    right: 5.6rem;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    display: none;
  }
`

const SExpandedHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 1.6rem;
  padding-bottom: 0.8rem;
`

const SLink = styled.a`
  color: ${({ theme }) => theme.colors.invertedContrast};
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
`

const SWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const SBurgerContainer = styled.button`
  padding: 1.2rem 0.8rem;
  display: inline-block;
  cursor: pointer;
  transition-property: opacity, filter;
  transition-duration: 0.15s;
  transition-timing-function: linear;
  text-transform: none;
  background-color: transparent;
  border: 0;
  margin: 0;
  overflow: visible;

  &:hover {
    opacity: 0.8;
  }
`

const SBurgerBox = styled.span`
  width: 4rem;
  height: 2.4rem;
  display: inline-block;
  position: relative;
  perspective: 8rem;
`

const SBurgerInner = styled.span<{ isExpanded: boolean }>`
  display: block;
  top: 50%;
  margin-top: -2px;
  width: 4rem;
  height: 0.4rem;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 0.4rem;
  position: absolute;
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition-property: transform;
  transition-duration: 0.15s;
  transition-timing-function: ease;

  ${({ isExpanded }) =>
    isExpanded &&
    `
    background-color: transparent !important;
    transform: rotateY(180deg);
  `}

  &::after,
  &::before {
    content: '';
    display: block;
    width: 4rem;
    height: 0.4rem;
    background-color: ${({ theme }) => theme.colors.invertedContrast};
    border-radius: 0.4rem;
    position: absolute;
    transition: transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition-property: transform;
    transition-duration: 0.15s;
    transition-timing-function: ease;
  }

  &::after {
    bottom: -10px;

    ${({ isExpanded }) =>
      isExpanded &&
      `
      transform: translate3d(0, -10px, 0) rotate(-45deg);
    `}
  }

  &::before {
    top: -10px;

    ${({ isExpanded }) =>
      isExpanded &&
      `
      transform: translate3d(0, 10px, 0) rotate(45deg);
    `}
  }
`

const SProfileMenuBadge = styled(ProfileMenuBadge)`
  background-color: transparent;
  border-color: ${({ theme }) => theme.colors.invertedContrast};
`

const SProfileMenuDropdown = styled(ProfileMenuDropdown)`
  top: -23rem;
  right: 0;

  &::after {
    width: 0;
    height: 0;
    border-left: 2.4rem solid transparent;
    border-right: 2.4rem solid transparent;
    z-index: 101;
    border-top: ${({ theme }) => `1.2rem solid ${theme.colors.contrast}`};
    content: '';
    position: absolute;
    bottom: 0;
    right: 3.2rem;
    transform: translateY(0.8rem);
  }
`

export default FloatingHeader
