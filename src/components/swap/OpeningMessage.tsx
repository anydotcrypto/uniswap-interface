import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Text } from 'rebass'
import { AppState } from '../../state'
import { useSelector } from 'react-redux'
import { utils } from 'ethers'
import { estimateGasCosts } from '../../state/gasprice/hooks'

const AdvancedDetailsHeader = styled.div<{ show: boolean }>`
  padding-top: calc(5px + 1rem);
  padding-bottom: 50px;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: -5rem;
  margin-bottom: -2rem;
  width: 100%;
  max-width: 400px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
  z-index: -1;
  vertical-align: 'text-top';

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

export default function OpeningMessage() {
  const state = useSelector<AppState, AppState['gasprice']>((state) => state.gasprice)

  const { lowestEstimateInGwei } = estimateGasCosts(state)

  return (
    <AdvancedDetailsHeader show={true}>
      <AutoColumn gap={'md'}>
        <RowBetween align="flex-start">
          <Text fontSize={12} fontWeight={'bold'} margin={'0 auto'}>
            {'Swap DAI to ETH via any.sender and pay the fee with DAI.'}
          </Text>
        </RowBetween>
        <RowBetween align="flex-start">
          <Text fontSize={12} fontWeight={500}>
            {'The gas fast rate is ~' +
              utils.formatUnits(state.fast, 'gwei') +
              ' gwei (etherchain). any.sender will try to beat it by sending the transaction at ~' +
              lowestEstimateInGwei +
              ' gwei before quickly bumping it up. '}
          </Text>
        </RowBetween>

        <RowBetween align="flex-start">
          <Text fontSize={12} fontWeight={500}>
            {
              'Please check "Network Fee (est)" and "To Receive (est)" for the ETH that is sent to you when the swap is executed.'
            }
          </Text>
        </RowBetween>
      </AutoColumn>{' '}
    </AdvancedDetailsHeader>
  )
}
