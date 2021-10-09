import styled from 'styled-components';

export const TradingWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 1255px;
  margin-top: ${({ theme }) => `${theme.space.S24}`};

  & > * {
    width: 100%;
  }
`

export const TradingButtons = styled.div`
    padding-left: ${({ theme }) => theme.space.S12};

    & > div > div > div > div {
        margin 0;
    }

    & > div {
      padding-bottom: ${({ theme }) => theme.space.S24};
    }
`