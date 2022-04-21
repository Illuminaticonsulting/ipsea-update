import React from 'react'
import styled, { css } from 'styled-components'
import {
  NftEffectType,
  NFT_EFFECT_BLUR,
  NFT_FILE_TYPE_IMAGE,
  NFT_FILE_TYPE_VIDEO,
} from 'interfaces'
import { useApp } from 'redux/hooks'

interface Props {
  blurValue: number
  coverNFT: File | null
  className?: string
  effect: NftEffectType
  originalNFT: File
  setBlurValue: (v: number) => void
  setCoverNFT: (f: File | null) => void
  setEffect: (effect: NftEffectType) => void
  setError: (err: string) => void
}

const DefaultEffect = css`
  width: 100%;
  height: 100%;
  border-radius: 1.2rem;
  background: linear-gradient(180deg, #f29fff 0%, #878cff 100%);
  box-shadow: ${({ theme }) => theme.shadows.popupShadow};
  object-fit: cover;
  overflow: hidden;
  position: absolute;
  transform: translateZ(0);
`
const SImage = styled.img<{ blurredValue: number }>`
  ${DefaultEffect}
  filter: ${({ blurredValue }) => `blur(${blurredValue}px)`};
  backdrop-filter: ${({ blurredValue }) => `blur(${blurredValue}px)`};
  -webkit-backdrop-filter: ${({ blurredValue }) => `blur(${blurredValue}px)`};
`
const SVideo = styled.video`
  ${DefaultEffect}
`

function returnType(NFTarg: File, blurredValue = 0) {
  if (NFTarg.type.slice(0, 5) === NFT_FILE_TYPE_IMAGE) {
    return <SImage alt="img" blurredValue={blurredValue} id="output" src={URL.createObjectURL(NFTarg)} />
  } else if (NFTarg.type.slice(0, 5) === NFT_FILE_TYPE_VIDEO) {
    return (
      <SVideo autoPlay muted playsInline loop key={NFTarg.name + NFTarg.lastModified}>
        <source id="outputVideo" src={URL.createObjectURL(NFTarg)} />
      </SVideo>
    )
  }else{
    return <SImage alt="img" blurredValue={blurredValue} id="output" src={'IP.png'} />
  }
}

const NftCardWithEffects = ({
  blurValue,
  className,
  effect,
  originalNFT,
}: Props) => {
  const { isRN } = useApp()


  return (
    <SWrapper className={className}>
      {returnType(originalNFT, effect === NFT_EFFECT_BLUR ? blurValue : 0)}      
    </SWrapper>
  )
}


const SWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 1.2rem;
  margin: 0 auto;
  max-width: 25rem;
  width: ${({ theme }) => theme.sizes.cardWidth.md};
  height: ${({ theme }) => theme.sizes.cardHeight.md};
  overflow: hidden;

  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    height: ${({ theme }) => theme.sizes.cardHeight.sm};
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    height: ${({ theme }) => theme.sizes.cardHeight.md};
  }
`

export default React.memo(NftCardWithEffects)
