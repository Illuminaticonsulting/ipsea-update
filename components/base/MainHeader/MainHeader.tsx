import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { ModalWallet } from 'components/base/Modal'
import { ProfileMenuBadge, ProfileMenuDropdown } from 'components/base/ProfileMenu'
import Button from 'components/ui/Button'
import Icon from 'components/ui/Icon'
import { Container, Wrapper } from 'components/layout'

import { computeCaps } from 'utils/strings'
import { useApp } from 'redux/hooks'

import { SigningCosmWasmClient } from 'secretjs'
import { NODE_API_URL } from 'utils/constant'
import { getUser } from 'actions/user'
import { encryptCookie } from 'utils/cookie'
import Cookies from 'js-cookie'

const MainHeader: React.FC = () => {
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
        alert("Please install keplr extension");

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
                    chainName: 'pulsar-2',
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
                console.log(accounts);

                const address = accounts[0].address;
                const walletId = address;
                let user = null
                try {
                  try {
                    user = await getUser(walletId)
                  } catch (err: any) {
                    if (err.message === "User can't be found Error" && walletId.startsWith('5') && walletId.length === 48) {
                      const response = await fetch(`${NODE_API_URL}/api/users/create`, {
                        method: 'POST',
                        body: JSON.stringify({ walletId }),
                      })
                      const res = await response.json()
                      if (res.walletId || (res?.errors?.length > 0 && res.errors[0].message === 'Wallet user already exists')) {
                        user = { walletId }
                      } else {
                        throw new Error('Error while creating user')
                      }
                    } else {
                      throw err
                    }
                  }
                } catch (err) {
                  user = null
                  console.log(err)
                }
                if (user) {
                  Cookies.set('token', encryptCookie(walletId), {
                    //sameSite: 'strict',
                    expires: 1,
                  })
                }
                window.location.reload()
                
            } catch (error) {
                console.error(error)
      
            }
        } else {
            alert("Please use the last version of keplr extension");
  
        }
    }
    
  } 
  
  const isNftCreationEnabled =
    process.env.NEXT_PUBLIC_IS_NFT_CREATION_ENABLED === undefined
      ? true
      : process.env.NEXT_PUBLIC_IS_NFT_CREATION_ENABLED === 'true'

  return (
    <>
      <Container>
        <SWrapper>
          <Link href="/">
            <a title="Marketplace homepage">
              <SLogo name="logoTernoaBlack" />
            </a>
          </Link>
          <SNavContainer>
            <SNavLinksContainer>
              <Link href="/explore" passHref>
                <SLinkItem>Explore</SLinkItem>
              </Link>
              <Link href="/faq" passHref>
                <SLinkItem>How it works</SLinkItem>
              </Link>
              <Link href="/message" passHref>
                <SLinkItem>Message</SLinkItem>
              </Link>              
            </SNavLinksContainer>
            <SNavButtonsCointainer>
              {isNftCreationEnabled && (
                <Link href="/create" passHref>
                  <>
                    <Button color="contrast" href="/create" size="medium" text="Create IP" variant="outlined" />
                  </>
                </Link>
              )}
              {user === undefined || user === null || user._id === '' ? (
                <Button
                  color="contrast"
                  // onClick={() => setIsModalWalletExpanded(true)}
                  onClick={wallet}
                  size="medium"
                  text="Connect"
                  variant="outlined"
                />
              ) : (
                <ProfileMenuBadge
                  onClick={() => setIsProfileMenuExpanded((prevState) => !prevState)}
                  tokenAmount={user.capsAmount ? computeCaps(Number(user.capsAmount)) : 0}
                  tokenSymbol="IPSEA"
                  user={user}
                />
              )}
            </SNavButtonsCointainer>
          </SNavContainer>
          {user && isProfileMenuExpanded && (
            <SProfileMenuDropdown onClose={() => setIsProfileMenuExpanded(false)} user={user} />
          )}
        </SWrapper>
      </Container>
      {isModalWalletExpanded && <ModalWallet setExpanded={setIsModalWalletExpanded} />}
    </>
  )
}

const SWrapper = styled(Wrapper)`
  flex-direction: row;
  justify-content: center;
  position: relative;
  padding-top: 3.2rem !important;
  padding-bottom: 3.2rem !important;

  ${({ theme }) => theme.mediaQueries.lg} {
    justify-content: space-between;
    padding-top: 4rem !important;
    padding-bottom: 4rem !important;
  }
`

const SLogo = styled(Icon)`
  width: 16rem;
  cursor: pointer;
`

const SNavContainer = styled.div`
  display: none;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: flex;
    align-items: center;
  }
`

const SNavLinksContainer = styled.div`
  display: flex;
  align-items: center;

  > * {
    &:not(:first-child) {
      margin-left: 2.4rem;
    }
  }
`

const SLinkItem = styled.a`
  color: ${({ theme }) => theme.colors.contrast};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 1.6rem;
`

const SNavButtonsCointainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.4rem;

  ${({ theme }) => theme.mediaQueries.lg} {
    margin-left: 5.6rem;
  }
`

const SProfileMenuDropdown = styled(ProfileMenuDropdown)`
  top: 10.4rem;
  right: 3.2rem;

  &::before {
    width: 0;
    height: 0;
    border-left: 2.4rem solid transparent;
    border-right: 2.4rem solid transparent;
    z-index: 101;
    border-top: ${({ theme }) => `1.2rem solid ${theme.colors.invertedContrast}`};
    content: '';
    position: absolute;
    top: -1.6rem;
    right: 3.2rem;
    transform: translateY(0.8rem) rotate(180deg);
  }
`

export default MainHeader
