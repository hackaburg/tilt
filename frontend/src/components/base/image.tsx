import styled from "@emotion/styled";
import * as React from "react";
import { borderRadius } from "../../config";

const Img = styled.img`
  max-width: 100%;
`;

interface IImageProps {
  src?: string;
  label: string;
}

/**
 * An image.
 */
export const Image = ({ src, label }: IImageProps) => (
  <Img src={src} alt={label} />
);

/**
 * An image with rounded corners.
 */
export const RoundedImage = styled.img`
  border-radius: ${borderRadius};
`;
