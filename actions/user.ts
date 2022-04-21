import { CustomResponse, ArtistHighlightType, UserType } from 'interfaces/index'
import { DEFAULT_LIMIT_PAGINATION, NODE_API_URL } from '../utils/constant'
import Cookies from 'js-cookie'

export const getUser = async (token: string, populateLikes = false) => {
  // const res = await fetch(`${NODE_API_URL}/api/users/${token}?populateLikes=${populateLikes}`)
  // const userData = await res.json()
  // if (userData?.errors?.length > 0) throw new Error(userData.errors[0].message)
  // const capsResponse = await fetch(`${NODE_API_URL}/api/users/${token}/caps`)

  // let capsData = null
  // if (capsResponse.ok) {
  //   capsData = await capsResponse.json()
  // }

  const userData = {
    "_id": "61bfb8cd18b5b398ed82f264",
    "walletId": token,
    "nonce": "chCmVVEDIEqJppU9lA4Dxg==",
    "reviewRequested": true,
    "verified": true,
    "artist": false,
    "nbFollowers": 0,
    "nbFollowing": 0,
    "name": "B Corp #5EAJT",
    "likedNFTs": [],
    "createdAt": "2021-12-19T22:57:17.729Z",
    "updatedAt": "2022-02-08T22:50:29.335Z",
    "__v": 0,
    "bio": "BCorp | Actual collection:\n\nSweet Donut Collection from BCorpNFTs gifts for holders, ranking, real life NFTs and more suprises coming... Sweet Donut is one of BCorp Evolutive Collections Every Collection contains 1000 NFTs and on these 1000 NFTs there is 10 levels Each level contains 100 NFTs, New level means that the NFT is completely reworked and redesigned Art is progress our collections go further, just like us The B Verse approaches,you will soon be able to invite your friends in the B Verse and own your personnal digital museum (VR Museum) Join the B Verse today\n",
    "twitterName": "@bcorpnfts",
    "twitterVerified": false,
    "picture": "https://ipfs.ternoa.dev/ipfs/QmSC47acdq3omHYPmcpgwj9qwLopthbmp3atLyGf6Un7tk",
    "customUrl": "https://www.ternoarare.com/bcorp",
    "twitterVerificationToken": "",
    "banner": "https://ipfs.ternoa.dev/ipfs/QmfTpJjx3D52EekeTrjCkn7CAwoMVkvP6ddz3t4BHFzj1P",
    "personalUrl": "https://opensea.io/collection/sweetdonut"
  }

  const capsData = { "capsAmount": "1e15" }

  return { ...userData, ...capsData }
}

export const getProfile = async (id: string, walletIdViewer: string | null, ip?: string) => {
  const res = await fetch(
    `${NODE_API_URL}/api/users/${id}?incViews=${true}&walletIdViewer=${walletIdViewer}&viewerIp=${ip}`
  )

  if (!res.ok) throw new Error()

  return await res.json()
}

export const getAccountBalance = async (id: string) => {
  const res = await fetch(`${NODE_API_URL}/api/users/${id}/caps`)

  if (!res.ok) throw new Error()

  const data = await res.json()
  return data.capsAmout
}

export const getUsers = async (
  walletIds?: string[],
  artist?: boolean,
  verified?: boolean,
  page = '1',
  limit: string = DEFAULT_LIMIT_PAGINATION
) => {
  const paginationOptions = { page, limit }
  const filter: any = {}
  if (walletIds) filter.walletIds = walletIds
  if (artist !== undefined) filter.artist = artist
  if (verified !== undefined) filter.verified = verified
  const res = await fetch(
    `${NODE_API_URL}/api/users/?filter=${JSON.stringify(filter)}&pagination=${JSON.stringify(paginationOptions)}`
  )
  if (!res.ok) throw new Error()
  const response: CustomResponse<UserType> = await res.json()
  return response
}

export const reviewRequested = async (walletId: string) => {
  const cookie = Cookies.get('token')
  if (cookie) {
    const res = await fetch(`${NODE_API_URL}/api/users/reviewRequested/${walletId}`, {
      method: 'PATCH',
      body: JSON.stringify({ cookie }),
    })
    if (!res.ok) throw new Error()
    const userData = await res.json()
    return userData
  } else {
    throw new Error('Unvalid authentication')
  }
}

export const getMostFollowedUsers = async (
  page = '1',
  limit: string = DEFAULT_LIMIT_PAGINATION,
  useCache = false
): Promise<CustomResponse<UserType>> => {
  const paginationOptions = { page, limit }
  const res = await fetch(
    `${NODE_API_URL}/api/users/most-followed/?pagination=${JSON.stringify(paginationOptions)}&useCache300=${useCache}`
  )
  if (!res.ok) throw new Error('error fetching most followed users')
  const result: CustomResponse<UserType> = await res.json()
  return result
}

export const getTopSellersUsers = async (
  page = '1',
  limit: string = DEFAULT_LIMIT_PAGINATION,
  useCache = false
): Promise<CustomResponse<UserType>> => {
  const paginationOptions = { page, limit }
  const res = await fetch(
    `${NODE_API_URL}/api/users/top-sellers/?pagination=${JSON.stringify(paginationOptions)}&useCache300=${useCache}`
  )
  if (!res.ok) throw new Error('error fetching top sellers users')
  const result: CustomResponse<UserType> = await res.json()
  return result
}

export const getArtistHighlight = async (): Promise<ArtistHighlightType> => {
  const res = await fetch(`${NODE_API_URL}/api/users/artist-highlight`)
  if (!res.ok) throw new Error('No suitable artist to highlight was found')
  const result: ArtistHighlightType = await res.json()
  return result
}
