'use client'

import { useState } from 'react'
import ContentEditor from '@/components/editor/ContentEditor'
import MediaGallery from '@/components/media/MediaGallery'
import { MediaFile } from '@/lib/media/types'

export default function ArticlesPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleSave = () => {
    console.log('Saving article:', { title, content })
    alert('文章已保存！（这是演示功能）')
  }

  const handleSelectMedia = (file: MediaFile) => {
    const mediaMarkdown = file.type === 'image' 
      ? `![${file.name}](${file.url})\n`
      : file.type === 'video'
      ? `\n[视频: ${file.name}](${file.url})\n`
      : `[${file.name}](${file.url})\n`
    
    setContent(prev => prev + '\n' + mediaMarkdown)
    setShowMediaGallery(false)
  }

  const renderPreview = (markdown: string) => {
    const lines = markdown.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(3)}</h2>
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-3 mb-2">{line.substring(4)}</h3>
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>
      } else if (line.match(/!\[.*?\]\(.*?\)/)) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/)
        if (match) {
          return <img key={index} src={match[2]} alt={match[1]} className="max-w-full my-4 rounded-lg" />
        }
      } else if (line.trim()) {
        return <p key={index} className="mb-2">{line}</p>
      }
      return <br key={index} />
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">创建文章</h1>
          <p className="mt-2 text-gray-600">撰写和发布您的内容</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {previewMode ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存文章
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              内容
            </label>
            {previewMode ? (
              <div className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-gray-50 prose max-w-none">
                <h1 className="text-3xl font-bold mb-4">{title || '无标题'}</h1>
                <div className="text-gray-700">
                  {content ? renderPreview(content) : <p className="text-gray-400">暂无内容</p>}
                </div>
              </div>
            ) : (
              <ContentEditor
                initialContent={content}
                onChange={setContent}
                onInsertMedia={() => setShowMediaGallery(!showMediaGallery)}
                placeholder="开始编写您的文章内容..."
              />
            )}
          </div>

          {showMediaGallery && !previewMode && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">选择媒体</h3>
              <MediaGallery
                onSelectMedia={handleSelectMedia}
                selectable={true}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 编辑提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 使用工具栏快速格式化文本</li>
          <li>• 点击"插入媒体"按钮从媒体库选择图片或视频</li>
          <li>• 支持 Markdown 语法进行更丰富的格式化</li>
          <li>• 使用预览模式查看文章的最终效果</li>
        </ul>
      </div>
    </div>
  )
}
