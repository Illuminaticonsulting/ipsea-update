import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import emojiRegex from 'emoji-regex'
import { checkMark, errorMark, loadingSpinner500 } from 'components/assets'
import { Advice, Container, InputLabel, InputShell, Insight, Title, Wrapper } from 'components/layout'
import NftPreview from 'components/base/NftPreview'
import ThumbnailNftPreview from 'components/base/ThumbnailNftPreview'

import {
  NFT_EFFECT_BLUR,
  NFT_EFFECT_DEFAULT,
  NFT_EFFECT_PROTECT,
  NFT_EFFECT_SECRET,
  CategoryType,
  NftEffectType,
} from 'interfaces'
import Autocomplete from 'components/ui/Autocomplete'
import Button from 'components/ui/Button'
import { Input, TextArea } from 'components/ui/Input'
import Tooltip from 'components/ui/Tooltip'

import { NFTProps } from 'pages/create'
import { canAddToSeries } from 'actions/nft'
import { processFile } from 'utils/imageProcessing/image'
import mime from 'mime-types'
import ThumbnailSelector from 'components/base/ThumbnailSelector'
import { useApp } from 'redux/hooks'

const DEFAULT_BLUR_VALUE = 5

export interface CreateProps {
  categoriesOptions: CategoryType[]
  NFTData: NFTProps
  thumbnailNFT: File | null
  originalNFT: File | null
  setError: (err: string) => void
  setIsModalMintExpanded: (b: boolean) => void
  setNFTData: (o: NFTProps) => void
  setThumbnailNFT: (f: File | null) => void
  setOriginalNFT: (f: File | null) => void
  setOutput: (s: string[]) => void
  setPreviewNFT: (f: File | null) => void
  thumbnailTimecode: number
  setThumbnailTimecode: (x: number) => void
}

const Create = ({
  categoriesOptions,
  NFTData: initalValue,
  thumbnailNFT,
  originalNFT,
  setError,
  setIsModalMintExpanded,
  setNFTData: setNftDataToParent,
  setThumbnailNFT,
  setOriginalNFT,
  setOutput,
  setPreviewNFT,
}: CreateProps) => {
  
  const { user } = useApp()
  const [blurValue, setBlurValue] = useState<number>(DEFAULT_BLUR_VALUE)
  const [coverNFT, setCoverNFT] = useState<File | null>(null) // Cover NFT used for secret effect
  const [effect, setEffect] = useState<NftEffectType>(NFT_EFFECT_DEFAULT)
  const [nftData, setNFTData] = useState(initalValue)
  const [isLoading, setIsLoading] = useState(false)
  const { categories, description, name, royalties, quantity } = nftData

  const validateRoyalty = (value: number, limit: number) => {
    return value > 0 && value <= limit
  }

  const validateQuantity = (value: number, limit: number) => {
    return value > 0 && value <= limit
  }

  const isDataValid =
    name &&
    description &&
    validateRoyalty(royalties, 10) &&
    validateQuantity(quantity, 10) &&
    thumbnailNFT &&
    originalNFT &&
    (effect !== NFT_EFFECT_SECRET || coverNFT) &&
    !isLoading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextNftData = { ...nftData, [e.target.name]: e.target.value }
    setNFTData(nextNftData)
    setNftDataToParent(nextNftData)
  }

  const handleCategoryChipDelete = (list: CategoryType[], id: CategoryType['_id']) => {
    const nextNftData = {
      ...nftData,
      categories: list.filter((item) => item._id !== id),
    }
    setNFTData(nextNftData)
    setNftDataToParent(nextNftData)
  }

  const handleCategoryOptionClick = (option: CategoryType) => {
    const nextNftData = {
      ...nftData,
      categories: categories.concat(option),
    }
    setNFTData(nextNftData)
    setNftDataToParent(nextNftData)
  }

  const initMintingNFT = async () => {
    try {
      if (!user) throw new Error('Please login to create an IP.')      
      if (thumbnailNFT !== null && originalNFT !== null) {
        setIsModalMintExpanded(true)
      }
    setOutput([quantity.toString()])
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(err as string)
      }
    }
  }

  const uploadFiles = async () => {
    setOutput([])
    setError('')
    try {
      initMintingNFT()
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(err as string)
      }
    }
  }

  useEffect(() => {
    setCoverNFT(null)
  }, [originalNFT, thumbnailNFT])

  return (
    <Container>
      <Wrapper>
        <Title>Create your IP</Title>
        <SNftPreviewWrapper>
        </SNftPreviewWrapper>
        <SForm>
          <SLeft>
            <InputLabel>
              Thumbnail
              <STooltip text="Thumbnail is a part of your IP source. You have to upload a thumbnail in order to show value of your IP to Buyer. Thumbnail can be changed later." />
            </InputLabel>
            <ThumbnailNftPreview
              blurValue={blurValue}
              coverNFT={coverNFT}
              effect={effect}
              thumbnailNFT={thumbnailNFT}
              setBlurValue={setBlurValue}
              setCoverNFT={setCoverNFT}
              setEffect={setEffect}
              setError={setError}
              setIsLoading={setIsLoading}
              setThumbnailNFT={setThumbnailNFT}
            />
          
            <Input label="Name" name="name" onChange={handleChange} placeholder="Enter name" value={name} />

            <STextArea
              label="Description"
              name="description"
              onChange={handleChange}
              placeholder="Tell about the IP in a few words..."
              value={description}
            />
          </SLeft>
          <SRight>
            <InputLabel>
              Main
              <STooltip text="Main is full source of your IP. This will be minted as a filecoin. Buyer owns your IP after purchase. Main can't be changed later." />
            </InputLabel>
            <NftPreview
              blurValue={blurValue}
              coverNFT={coverNFT}
              effect={effect}
              originalNFT={originalNFT}
              setBlurValue={setBlurValue}
              setCoverNFT={setCoverNFT}
              setEffect={setEffect}
              setError={setError}
              setIsLoading={setIsLoading}
              setOriginalNFT={setOriginalNFT}
            />
            
            <Autocomplete<CategoryType>
              label={
                <>
                  Categories<SInsight>(optional)</SInsight>
                </>
              }
              list={categories}
              onChipDelete={handleCategoryChipDelete}
              onOptionClick={handleCategoryOptionClick}
              /* Remove already set categories */
              options={categoriesOptions.filter(
                ({ name }) => !categories.find(({ name: listItemName }) => listItemName === name)
              )}
            />
            <Input
                insight="(max: 10%)"
                isError={!validateRoyalty(royalties, 10)}
                label="Royalties"
                name="royalties"
                onChange={handleChange}
                placeholder="Enter royalties"
                value={royalties}
              />

            <Input
              insight="(max: 10)"
              isError={!validateQuantity(quantity, 10)}
              label="Quantity"
              name="quantity"
              onChange={handleChange}
              placeholder="1"
              value={quantity}
            />

          </SRight>
        </SForm>
        <SAdvice>Information cannot be modified after IP is created !</SAdvice>
        <SButton color="primary500" disabled={!(isDataValid && user)} onClick={uploadFiles} text="Create IP" />
      </Wrapper>
    </Container>
  )
}

const SNftPreviewWrapper = styled.div`
  margin-top: 3.2rem;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 5.4rem;
  }
`

const SForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 4rem;

  > * {
    width: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    align-items: normal;
    flex-direction: row;
    margin-top: 12rem;
  }
`

const FormSideLayout = styled.div`
  > * {
    margin-top: 4rem;

    ${({ theme }) => theme.mediaQueries.md} {
      margin-top: 6.4rem;
    }

    &:first-child {
      margin-top: 0;
    }
  }
`

const SLeft = styled(FormSideLayout)`
  ${({ theme }) => theme.mediaQueries.md} {
    border-right: 1px solid #e0e0e0;
    padding-right: 4.8rem;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    padding-right: 13.6rem;
  }
`

const SRight = styled(FormSideLayout)`
  margin-top: 4rem;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-left: 4.8rem;
    margin-top: 0;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    padding-left: 13.6rem;
  }
`

const STextArea = styled(TextArea)`
  flex: 1;
`

const STooltip = styled(Tooltip)`
  margin-left: 0.4rem;
`

const SInsight = styled(Insight)`
  margin-left: 0.8rem;
`

const SAdvice = styled(Advice)`
  margin: 4rem auto 0;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.xl} {
    margin: 7.2rem auto 0;
  }
`

const SButton = styled(Button)`
  margin-top: 4.8rem;
`

export default Create
