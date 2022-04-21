import React from 'react'
import styled from 'styled-components'

import { Container, Title, Wrapper } from 'components/layout'
import { useMarketplaceData } from 'redux/hooks'

import Section from './Section'

const FAQ = () => {
  const { name } = useMarketplaceData()

  const sections = [
    {
      question: `What is ${name} Marketplace ?`,
      answer: `“${name}” is a peer-to-peer platform that enables the monetization of Intellectual Property (IP) files in a secure and decentralized environment.`,
    },
    {
      question: `What is Intellectual Property (IP) ?`,
      answer: `Creations of the mind, such as inventions; literary and artistic works; designs; and symbols, names and images used in commerce across multiple applications.`,
    },
      
  ]

  return (
    <Container>
      <Wrapper>
        <Title>How it works ?</Title>
        <SSubtitle>FAQ</SSubtitle>
        <SSectionsWrapper>
          {sections.map((x, index) => (
            <Section key={index} section={x} />
          ))}
        </SSectionsWrapper>
      </Wrapper>
    </Container>
  )
}

const SSubtitle = styled.div`
  font-size: 3.2rem;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 4rem;
    text-align: left;
  }
`

const SSectionsWrapper = styled.div`
  margin-top: 0.8rem;

  ${({ theme }) => theme.mediaQueries.lg} {
    margin-top: 8rem;
  }
`

export default FAQ
