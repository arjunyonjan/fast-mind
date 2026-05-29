"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft,
  AlignCenter, AlignRight, Code, Link as LinkIcon, Image as ImageIcon,
  Highlighter, Undo, Redo
} from 'lucide-react';

const ToolButton = ({ onClick, active, children, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded transition-all ${
      active
        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200'
    }`}
    type="button"
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />;

export default function AdvancedEditor({ content, onChange, placeholder }: any) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
      Highlight,
      Typography,
      CodeBlock.configure({
        HTMLAttributes: { class: 'rounded-lg bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200 p-4 font-mono text-sm' },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 dark:prose-invert prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:text-zinc-800 dark:prose-code:text-zinc-200',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <>
      <style>{`
        .tiptap-editor .ProseMirror {
          color: #18181b;
          background: #ffffff;
        }
        .dark .tiptap-editor .ProseMirror {
          color: #e4e4e7;
          background: #18181b;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #a1a1aa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #52525b;
        }
        .tiptap-editor .ProseMirror ::selection {
          background: rgba(6, 182, 212, 0.2);
        }
      `}</style>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-700 p-2 flex flex-wrap gap-1 bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
          <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Code size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => setShowLinkInput(!showLinkInput)} active={editor.isActive('link')}><LinkIcon size={18} /></ToolButton>
          <ToolButton onClick={addImage}><ImageIcon size={18} /></ToolButton>
          <Divider />
          <ToolButton onClick={() => editor.chain().focus().undo().run()}><Undo size={18} /></ToolButton>
          <ToolButton onClick={() => editor.chain().focus().redo().run()}><Redo size={18} /></ToolButton>
        </div>
        {showLinkInput && (
          <div className="border-b border-zinc-200 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 flex gap-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-cyan-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
            />
            <button onClick={addLink} className="px-3 py-1 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition">Add</button>
            <button onClick={() => setShowLinkInput(false)} className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancel</button>
          </div>
        )}
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
