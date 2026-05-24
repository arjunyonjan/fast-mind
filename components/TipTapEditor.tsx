"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Quote, Undo, Redo, Link } from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = "Start writing..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-lg prose-invert max-w-none focus:outline-none min-h-[60vh] text-zinc-300 leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const btn = "p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition";
  const active = "bg-zinc-800 text-white";

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 flex-wrap">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btn} ${editor.isActive("bold") ? active : ""}`}><Bold size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} ${editor.isActive("italic") ? active : ""}`}><Italic size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btn} ${editor.isActive("underline") ? active : ""}`}><UnderlineIcon size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btn} ${editor.isActive("strike") ? active : ""}`}><Strikethrough size={16} /></button>
        <span className="w-px h-5 bg-zinc-700 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btn} ${editor.isActive("bulletList") ? active : ""}`}><List size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btn} ${editor.isActive("orderedList") ? active : ""}`}><ListOrdered size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btn} ${editor.isActive("blockquote") ? active : ""}`}><Quote size={16} /></button>
        <button onClick={addLink} className={`${btn} ${editor.isActive("link") ? active : ""}`}><Link size={16} /></button>
        <span className="w-px h-5 bg-zinc-700 mx-1" />
        <button onClick={() => editor.chain().focus().undo().run()} className={btn}><Undo size={16} /></button>
        <button onClick={() => editor.chain().focus().redo().run()} className={btn}><Redo size={16} /></button>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
