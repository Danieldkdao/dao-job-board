"use client";

import { cn } from "@/lib/utils";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { useTheme } from "next-themes";
import { Ref } from "react";
import { markdownClassNames } from "./markdown-renderer";

const InternalMarkdownEditor = ({
  ref,
  className,
  ...props
}: MDXEditorProps & { ref?: Ref<MDXEditorMethods> }) => {
  const { resolvedTheme } = useTheme();

  return (
    <MDXEditor
      {...props}
      ref={ref}
      className={cn(
        markdownClassNames,
        resolvedTheme === "dark" && "dark-theme",
        className,
      )}
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <InsertThematicBreak />
              <InsertTable />
            </>
          ),
        }),
      ]}
    />
  );
};

export default InternalMarkdownEditor;
