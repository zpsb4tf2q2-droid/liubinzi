'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { MediaFile } from '@/lib/media/types'

interface ContentEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onInsertMedia?: () => void
  placeholder?: string
}

export default function ContentEditor({
  initialContent = '',
  onChange,
  onInsertMedia,
  placeholder = '开始编写内容...'
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onChange?.(newContent)
  }

  const handleSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      if (start !== end) {
        setSelectedText({ start, end })
      } else {
        setSelectedText(null)
      }
    }
  }

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selectedContent = content.substring(start, end)
    
    const newContent =
      content.substring(0, start) +
      before +
      selectedContent +
      after +
      content.substring(end)

    setContent(newContent)
    onChange?.(newContent)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPosition = start + before.length + selectedContent.length + after.length
        textareaRef.current.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }

  const insertMedia = (url: string, type: 'image' | 'video') => {
    const mediaMarkdown = type === 'image' 
      ? `![图片](${url})\n`
      : `[视频](${url})\n`
    
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const newContent = 
      content.substring(0, start) +
      mediaMarkdown +
      content.substring(start)
    
    setContent(newContent)
    onChange?.(newContent)
  }

  const formatBold = () => insertText('**', '**')
  const formatItalic = () => insertText('*', '*')
  const formatHeading = () => insertText('## ')
  const formatLink = () => insertText('[', '](url)')
  const formatList = () => insertText('- ')
  const formatCode = () => insertText('`', '`')

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          onClick={formatHeading}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="标题"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        <button
          onClick={formatBold}
          className="p-2 hover:bg-gray-200 rounded transition-colors font-bold"
          title="粗体"
          type="button"
        >
          B
        </button>

        <button
          onClick={formatItalic}
          className="p-2 hover:bg-gray-200 rounded transition-colors italic"
          title="斜体"
          type="button"
        >
          I
        </button>

        <button
          onClick={formatLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="链接"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        <button
          onClick={formatList}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="列表"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={formatCode}
          className="p-2 hover:bg-gray-200 rounded transition-colors font-mono"
          title="代码"
          type="button"
        >
          {'</>'}
        </button>

        <div className="border-l border-gray-300 mx-1"></div>

        {onInsertMedia && (
          <button
            onClick={onInsertMedia}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="插入媒体"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onSelect={handleSelection}
        placeholder={placeholder}
        className="w-full p-4 min-h-[400px] resize-y focus:outline-none font-mono text-sm"
      />

      <div className="border-t border-gray-300 bg-gray-50 px-4 py-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>支持 Markdown 格式</span>
          <span>{content.length} 字符</span>
        </div>
      </div>
    </div>
  )
}
