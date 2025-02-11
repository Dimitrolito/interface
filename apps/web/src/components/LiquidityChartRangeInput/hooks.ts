// eslint-disable-next-line no-restricted-imports
import { ProtocolVersion } from '@uniswap/client-pools/dist/pools/v1/types_pb'
import { Currency } from '@uniswap/sdk-core'
import { ChartEntry } from 'components/LiquidityChartRangeInput/types'
import { usePoolActiveLiquidity } from 'hooks/usePoolTickData'
import { useCallback, useMemo } from 'react'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { TickProcessed } from 'utils/computeSurroundingTicks'

/**
 * Currency A and B should be sorted to get accurate data, but you can pass invertPrices = true
 * to get inverted prices.
 */
export function useDensityChartData({
  poolId,
  currencyA,
  currencyB,
  feeAmount,
  invertPrices,
  version,
  chainId,
  tickSpacing,
  hooks,
}: {
  poolId?: string
  currencyA?: Currency
  currencyB?: Currency
  feeAmount?: number
  invertPrices?: boolean
  version: ProtocolVersion
  chainId?: UniverseChainId
  tickSpacing?: number
  hooks?: string
}) {
  const { isLoading, error, data } = usePoolActiveLiquidity({
    currencyA,
    currencyB,
    version,
    poolId,
    feeAmount,
    chainId,
    tickSpacing,
    hooks,
  })

  const formatData = useCallback(() => {
    if (!data?.length) {
      return undefined
    }

    const newData: ChartEntry[] = []

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i]

      const price0 = invertPrices ? t.sdkPrice.invert().toSignificant(8) : t.sdkPrice.toSignificant(8)

      const chartEntry = {
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: parseFloat(price0),
        tick: t.tick,
      }

      if (chartEntry.activeLiquidity > 0) {
        newData.push(chartEntry)
      }
    }

    return newData
  }, [data, invertPrices])

  return useMemo(() => {
    return {
      isLoading,
      error,
      formattedData: !isLoading ? formatData() : undefined,
    }
  }, [isLoading, error, formatData])
}
