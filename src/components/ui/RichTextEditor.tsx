"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-sci-border bg-sci-dark/80 rounded-t-md">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn("p-1.5 rounded hover:bg-sci-border transition-colors", editor.isActive('bold') ? "bg-sci-accent text-sci-dark" : "text-sci-silver")}
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn("p-1.5 rounded hover:bg-sci-border transition-colors", editor.isActive('italic') ? "bg-sci-accent text-sci-dark" : "text-sci-silver")}
            >
                <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-sci-border mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("p-1.5 rounded hover:bg-sci-border transition-colors", editor.isActive('heading', { level: 3 }) ? "bg-sci-accent text-sci-dark" : "text-sci-silver")}
            >
                <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-sci-border mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("p-1.5 rounded hover:bg-sci-border transition-colors", editor.isActive('bulletList') ? "bg-sci-accent text-sci-dark" : "text-sci-silver")}
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("p-1.5 rounded hover:bg-sci-border transition-colors", editor.isActive('orderedList') ? "bg-sci-accent text-sci-dark" : "text-sci-silver")}
            >
                <ListOrdered className="w-4 h-4" />
            </button>
        </div>
    )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-6 space-y-1',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal ml-6 space-y-1',
                    },
                },
                heading: {
                    levels: [3],
                    HTMLAttributes: {
                        class: 'text-xl font-bold mt-4 mb-2 text-white',
                    },
                },
                paragraph: {
                    HTMLAttributes: {
                        class: 'mb-4 last:mb-0',
                    }
                }
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'min-h-[150px] p-4 text-sm text-sci-silver focus:outline-none',
            },
        },
    })

    // Support external content update (e.g. async load in form reset)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Aggressively set content to match external state overrides (like language toggle)
            const { from, to } = editor.state.selection;
            editor.commands.setContent(content, { emitUpdate: false });
            try {
                editor.commands.setTextSelection({ from, to });
            } catch (e) {
                // Ignore selection error if bounds changed dramatically
            }
        }
    }, [content, editor])

    return (
        <div className="w-full rounded-md border border-sci-border bg-sci-dark/50 focus-within:ring-1 focus-within:ring-sci-accent focus-within:border-sci-accent transition-all duration-200 overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
