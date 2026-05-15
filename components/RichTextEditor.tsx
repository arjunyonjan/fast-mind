"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
    ],
    content: content,
    editorProps: {
      attributes: { class: 'prose prose-cyan max-w-none focus:outline-none min-h-[300px]' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children }: any) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded ${active ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-gray-100'}`}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          H3
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          1. List
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="p-4" />
    </div>
  );
}
