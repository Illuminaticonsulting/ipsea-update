/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

import { getUser } from 'actions/user'
import Modal from 'components/ui/Modal'
import { NODE_API_URL } from 'utils/constant'
import { encryptCookie } from 'utils/cookie'
import { SigningCosmWasmClient } from 'secretjs'

export interface ModalWalletProps {
  setExpanded: (b: boolean) => void
}

const ModalWallet: React.FC<ModalWalletProps> = ({ setExpanded }) => {
  const [error, setError] = useState('')
  return (
      <Modal
        error={error}
        setExpanded={setExpanded}
        subtitle=""
        title="Please install keplr extension."
      >   
        <a href='https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap' target="_blank"> 
          <h1> click here </h1>
        </a>

      </Modal>
    )
}

export default ModalWallet
