import * as React from "react";
import FlexView from "react-flexview";
import ReactMarkdown from "react-markdown";
import { Heading, Subheading, Subsubheading } from "./headings";
import { Image } from "./image";
import { Text } from "./text";

const renderers: ReactMarkdown.Renderers = {
  ...ReactMarkdown.renderers,
  heading: ({ children, level }) => {
    switch (level) {
      case 1:
        return <Heading>{children}</Heading>;

      case 2:
        return <Subheading>{children}</Subheading>;
    }

    return <Subsubheading>{children}</Subsubheading>;
  },
  image: ({ src, alt }) => <Image src={src} label={alt} />,
  paragraph: ({ children }) => <Text>{children}</Text>,
  root: ({ children }) => (
    <FlexView column grow>
      {children}
    </FlexView>
  ),
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
