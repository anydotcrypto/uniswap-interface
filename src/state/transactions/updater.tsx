import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { AnyDotSenderProviderClient } from '@any-sender/client'

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: {}; lastCheckedBlockNumber?: number }
): boolean {
  //   return true

  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  // we only check once
  return false

  //   const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  //   if (blocksSinceCheck < 1) return false
  //   const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  //   if (minutesPending > 60) {
  //     // every 10 blocks if pending for longer than an hour
  //     return blocksSinceCheck > 9
  //   } else if (minutesPending > 5) {
  //     // every 3 blocks if pending more than 5 minutes
  //     return blocksSinceCheck > 2
  //   } else {
  //     // otherwise every block
  //     return true
  //   }
}

export default function Updater() {
  const { chainId, library } = useActiveWeb3React()

  const lastBlockNumber = useBlockNumber()

  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  const transactions = chainId ? state[chainId] ?? {} : {}

  // show popup on confirm
  const addPopup = useAddPopup()

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    // for each of the transactions we start a wait

    const apiUrl =
      chainId === 3 ? 'https://api.anydot.dev/any.sender.ropsten' : 'https://api.anydot.dev/any.sender.mainnet'
    const receiptSigner =
      chainId === 3 ? '0xe41743ca34762b84004d3abe932443fc51d561d5' : '0x02111c619c5b7e2aa5c1f5e09815be264d925422'
    const providerClient = new AnyDotSenderProviderClient(library.provider, {
      apiUrl: apiUrl,
      receiptSignerAddress: receiptSigner
    })

    Object.keys(transactions)
      .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach(hash => {
        dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
        providerClient
          .waitForTransaction(hash)
          .then(receipt => {
            dispatch(
              finalizeTransaction({
                chainId,
                hash,
                receipt: {
                  blockHash: receipt.blockHash,
                  blockNumber: receipt.blockNumber,
                  contractAddress: receipt.contractAddress,
                  from: receipt.from,
                  status: receipt.status,
                  to: receipt.to,
                  transactionHash: receipt.transactionHash,
                  transactionIndex: receipt.transactionIndex
                }
              })
            )

            addPopup(
              {
                txn: {
                  hash: receipt.transactionHash,
                  success: receipt.status === 1,
                  summary: transactions[hash]?.summary
                }
              },
              hash
            )
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })

        // library
        //   .getTransactionReceipt(hash)
        //   .then(receipt => {
        //     if (receipt) {
        //       dispatch(
        //         finalizeTransaction({
        //           chainId,
        //           hash,
        //           receipt: {
        //             blockHash: receipt.blockHash,
        //             blockNumber: receipt.blockNumber,
        //             contractAddress: receipt.contractAddress,
        //             from: receipt.from,
        //             status: receipt.status,
        //             to: receipt.to,
        //             transactionHash: receipt.transactionHash,
        //             transactionIndex: receipt.transactionIndex
        //           }
        //         })
        //       )

        //       addPopup(
        //         {
        //           txn: {
        //             hash,
        //             success: receipt.status === 1,
        //             summary: transactions[hash]?.summary
        //           }
        //         },
        //         hash
        //       )
        //     } else {
        //       dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
        //     }
      })
  }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup])

  return null
}
