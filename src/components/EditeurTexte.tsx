'use client'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

type Props = {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

const btnStyle = (actif: boolean): React.CSSProperties => ({
  padding: '4px 8px',
  borderRadius: '6px',
  border: 'none',
  background: actif ? '#28558b' : '#f0f0f0',
  color: actif ? 'white' : '#444',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'inherit',
  fontWeight: 600,
  transition: 'all 0.15s',
})

export default function EditeurTexte({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  useEffect(() => {
    if (editor && value === '') {
      editor.commands.clearContent()
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
      {/* Barre d'outils */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', background: '#f8f6f1', borderBottom: '1px solid #eee' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))} title="Gras">B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...btnStyle(editor.isActive('italic')), fontStyle: 'italic' }} title="Italique">I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ ...btnStyle(editor.isActive('underline')), textDecoration: 'underline' }} title="Souligné">S</button>
        <div style={{ width: '1px', background: '#ddd', margin: '0 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))} title="Puces">• Liste</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))} title="Numérotation">1. Liste</button>
        <div style={{ width: '1px', background: '#ddd', margin: '0 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} style={btnStyle(editor.isActive({ textAlign: 'left' }))} title="Gauche">⬅</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} style={btnStyle(editor.isActive({ textAlign: 'center' }))} title="Centre">↔</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} style={btnStyle(editor.isActive({ textAlign: 'right' }))} title="Droite">➡</button>
        <div style={{ width: '1px', background: '#ddd', margin: '0 4px' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))} title="Citation">❝</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btnStyle(false)} title="Séparateur">—</button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)} title="Annuler">↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)} title="Rétablir">↪</button>
      </div>

      {/* Zone de texte */}
      <EditorContent
        editor={editor}
        style={{ minHeight: '120px', padding: '12px 14px', fontSize: '14px', lineHeight: 1.7 }}
      />

      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p { margin: 0 0 8px; }
        .ProseMirror ul { padding-right: 20px; padding-left: 20px; }
        .ProseMirror ol { padding-right: 20px; padding-left: 20px; }
        .ProseMirror blockquote { border-left: 3px solid #28558b; margin: 8px 0; padding-left: 12px; color: #666; font-style: italic; }
        .ProseMirror hr { border: none; border-top: 1px solid #eee; margin: 12px 0; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #aaa; pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  )
}