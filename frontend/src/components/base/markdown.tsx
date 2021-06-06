import * as React from "react";
import ReactMarkdown from "react-markdown";
import { FlexColumnContainer } from "./flex";
import { Heading, Subheading, Subsubheading } from "./headings";
import { Image } from "./image";
import { Text } from "./text";
const renderers: ReactMarkdown.TransformOptions["components"] = {
  h1: ({ children }) => <Heading text={children} />,
  h2: ({ children }) => <Subheading text={children} />,
  h3: ({ children }) => <Subsubheading text={children} />,
  img: ({ src, alt }) => <Image src={src as string} label={alt as string} />,
  p: ({ children }) => <Text>{children}</Text>,
};
interface IMarkdownProps {
  text: string;
}
/**
 * Renders markdown.
 */
export const Markdown = ({ text }: IMarkdownProps) => (
  <FlexColumnContainer>
    <ReactMarkdown linkTarget="_blank" components={renderers}>
      {text}
    </ReactMarkdown>
  </FlexColumnContainer>
);
