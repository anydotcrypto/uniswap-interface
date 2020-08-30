import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'

const Footer = styled.div<{ show: boolean }>`
  margin: 0 auto;
  text-align: center;
  padding: 1rem;

  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
`

export default function StickyFooter() {
  return (
    <Footer show={true}>
      <Text fontSize={12} fontWeight={500} margin={'0 auto'}>
        Forked with ♡ from Uniswap
      </Text>
    </Footer>
  )
}
