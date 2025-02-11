import { NumberValue, ScaleLinear, axisLeft, Axis as d3Axis, select } from 'd3'
import styled from 'lib/styled-components'
import { useMemo } from 'react'

const StyledGroup = styled.g`
  line {
    display: none;
  }

  text {
    color: ${({ theme }) => theme.neutral2};
  }
`

const TEXT_Y_OFFSET = 10

const Axis = ({
  axisGenerator,
  height,
  yScale,
}: {
  axisGenerator: d3Axis<NumberValue>
  height: number
  yScale: ScaleLinear<number, number>
}) => {
  const axisRef = (axis: SVGGElement) => {
    if (axis) {
      select(axis)
        .call(axisGenerator)
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g.selectAll('text').attr('transform', function (d) {
            const yCoordinate = yScale(d as number)
            if (yCoordinate < TEXT_Y_OFFSET) {
              return `translate(0, ${TEXT_Y_OFFSET}) scale(-1,-1)`
            }
            if (yCoordinate > height - TEXT_Y_OFFSET) {
              return `translate(0, ${-TEXT_Y_OFFSET}) scale(-1,-1)`
            }
            return 'scale(-1, -1)'
          }),
        )
    }
  }

  return <g ref={axisRef} />
}

export const AxisLeft = ({
  yScale,
  offset = 0,
  min,
  current,
  max,
  height,
}: {
  yScale: ScaleLinear<number, number>
  height: number
  offset?: number
  min?: number
  current?: number
  max?: number
}) => {
  const tickValues = useMemo(() => {
    const minCoordinate = min ? yScale(min) : undefined
    const maxCoordinate = max ? yScale(max) : undefined
    const currentCoordinate = current ? yScale(current) : undefined
    if (minCoordinate && currentCoordinate && Math.abs(minCoordinate - currentCoordinate) < TEXT_Y_OFFSET) {
      return [min, max].filter(Boolean) as number[]
    }
    if (maxCoordinate && currentCoordinate && Math.abs(maxCoordinate - currentCoordinate) < TEXT_Y_OFFSET) {
      return [min, max].filter(Boolean) as number[]
    }
    return [min, current, max].filter(Boolean) as number[]
  }, [current, max, min, yScale])

  return (
    <StyledGroup transform={`translate(${offset}, 0)`}>
      <Axis axisGenerator={axisLeft(yScale).tickValues(tickValues)} height={height} yScale={yScale} />
    </StyledGroup>
  )
}
