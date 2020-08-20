import * as React from "react";
import ReactMarkdown from "react-markdown";
import { FlexColumnContainer } from "./flex";
import { Heading, Subheading, Subsubheading } from "./headings";
import { Image } from "./image";
import { Text } from "./text";

const renderers: ReactMarkdown.Renderers = {
  ...ReactMarkdown.renderers,
  heading: ({ children, level }) => {
    switch (level) {
      case 1:
        return <Heading text={children} />;

      case 2:
        return <Subheading text={children} />;
    }

    return <Subsubheading text={children} />;
  },
  image: ({ src, alt }) => <Image src={src} label={alt} />,
  paragraph: ({ children }) => <Text>{children}</Text>,
  root: ({ children }) => <FlexColumnContainer>{children}</FlexColumnContainer>,
};

interface IMarkdownProps {
  text: string;
}

/**
 * Renders markdown.
 */
export const Markdown = ({ text }: IMarkdownProps) => (
  <ReactMarkdown
    source={text}
    linkTarget="_blank"
    renderers={renderers as any}
  />
);
