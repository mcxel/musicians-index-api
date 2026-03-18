// tmi-platform/apps/web/src/components/editorial/JsonContentRenderer.tsx
'use client';

import type { ReactNode } from 'react';

// This is a simplified renderer for the JSON content format from the backend.
// A production app might use a library or a more extensive switch statement.

type JsonContentNode = {
  type: string;
  attrs?: { level?: number; start?: number; [key: string]: unknown };
  content?: JsonContentNode[];
  text?: string;
};

function renderChildren(content: JsonContentNode[] | undefined): ReactNode {
  if (!content || content.length === 0) {
    return null;
  }

  return content.map((child, index) => renderNode(child, index));
}

const renderNode = (node: JsonContentNode, index: number): ReactNode => {
  switch (node.type) {
    case 'doc':
      return renderChildren(node.content);

    case 'heading': {
      const Tag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
      return <Tag key={index}>{renderChildren(node.content)}</Tag>;
    }

    case 'paragraph':
      return <p key={index}>{renderChildren(node.content)}</p>;

    case 'orderedList':
      return <ol key={index} start={typeof node.attrs?.start === 'number' ? node.attrs.start : 1}>{renderChildren(node.content)}</ol>;

    case 'listItem':
      return <li key={index}>{renderChildren(node.content)}</li>;

    case 'text':
      return node.text ?? null;

    default:
      console.warn('Unknown node type in JSON content:', node.type);
      return null;
  }
};

export function JsonContentRenderer({ content }: { content: JsonContentNode }) {
  if (!content || !content.type) {
    return null;
  }

  return <>{renderNode(content, 0)}</>;
}
