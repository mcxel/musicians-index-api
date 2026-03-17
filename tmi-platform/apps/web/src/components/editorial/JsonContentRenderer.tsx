// tmi-platform/apps/web/src/components/editorial/JsonContentRenderer.tsx
'use client';

// This is a simplified renderer for the JSON content format from the backend.
// A production app might use a library or a more extensive switch statement.

type Node = {
  type: string;
  attrs?: { level?: number; [key: string]: any };
  content?: Node[];
  text?: string;
};

const renderNode = (node: Node, index: number): React.ReactNode => {
  switch (node.type) {
    case 'doc':
      return node.content?.map(renderNode);

    case 'heading':
      const Tag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
      return <Tag key={index}>{node.content?.map(renderNode)}</Tag>;

    case 'paragraph':
      return <p key={index}>{node.content?.map(renderNode)}</p>;
    
    case 'orderedList':
      return <ol key={index} start={node.attrs?.start || 1}>{node.content?.map(renderNode)}</ol>;

    case 'listItem':
      return <li key={index}>{node.content?.map(renderNode)}</li>;

    case 'text':
      return node.text;

    default:
      console.warn('Unknown node type in JSON content:', node.type);
      return null;
  }
};

export function JsonContentRenderer({ content }: { content: Node }) {
  if (!content || !content.type) {
    return null;
  }

  return <>{renderNode(content, 0)}</>;
}
