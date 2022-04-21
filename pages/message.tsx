import React from 'react'
import Head from 'next/head'
import BetaBanner from 'components/base/BetaBanner'
import Footer from 'components/base/Footer'
import FloatingHeader from 'components/base/FloatingHeader'
import MainHeader from 'components/base/MainHeader'
import Message from 'components/pages/Message'
import { useMarketplaceData } from 'redux/hooks'

const MessagePage = () => {
  const { name } = useMarketplaceData()

  return (
    <>
      <Head>
        <title>{name} - Message</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Message page of SecretNFT, by Ternoa." />
        <meta name="og:image" content="ternoa-social-banner.jpg" />
      </Head>
      <BetaBanner />
      <MainHeader />
      <Message />
      <Footer />
      <FloatingHeader />
    </>
  )
}

export default MessagePage
