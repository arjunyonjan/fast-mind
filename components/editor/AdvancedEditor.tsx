'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function AdvancedEditor({ content, onChange, placeholder = 'Start writing...' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-ins that you're adding separately
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
        },
        underline: false, // Remove if you add Underline extension separately
      }),
      Placeholder.configure({
        placeholder,
      }),
      // Add other extensions here, but NOT Link or Underline if using StarterKit defaults
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none max-w-none dark:prose-invert min-h- px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content!== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return <EditorContent editor={editor} />
}
