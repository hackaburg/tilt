import styled from "@emotion/styled";
import { gridColumnPadding, mediaBreakpoints } from "../config";

/**
 * A row in a grid layout.
 */
export const Row = styled.div`
  display: block;
  margin: 0rem -${gridColumnPadding};

  &::after {
    content: " ";
    display: table;
    clear: both;
  }
`;

interface IColProps {
  percent: number;
}

/**
 * A column in a grid row with a dynamic width.
 */
export const Col = styled.div<IColProps>`
  display: block;
  float: left;
  width: ${(props) => props.percent}%;

  padding: 0rem ${gridColumnPadding};

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    float: none;
    width: 100%;
  }
`;
