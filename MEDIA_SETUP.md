# 媒体处理功能设置指南

本文档介绍如何设置和使用媒体处理功能。

## 功能概览

本应用包含以下媒体处理功能：

- ✅ 文件上传到 Supabase Storage
- ✅ 图片预览和管理
- ✅ 视频嵌入和播放
- ✅ 内容编辑器集成
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 上传进度反馈
- ✅ 拖拽上传支持
- ✅ 媒体库管理界面

## Supabase Storage 设置

在使用媒体功能之前，您需要在 Supabase 中创建存储桶：

### 1. 登录 Supabase Dashboard

访问 [https://supabase.com/dashboard](https://supabase.com/dashboard) 并登录到您的项目。

### 2. 创建 Storage Bucket

1. 在左侧菜单中点击 **Storage**
2. 点击 **New bucket** 按钮
3. 输入 bucket 名称：`media`
4. 选择 **Public bucket**（用于公开访问上传的媒体文件）
5. 点击 **Create bucket**

### 3. 配置 Storage 策略（可选）

如果需要限制访问权限，可以在 **Policies** 标签中配置 RLS（Row Level Security）策略：

```sql
-- 允许所有人查看
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 允许认证用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 允许用户删除自己的文件
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);
```

## 文件类型和大小限制

默认配置（可在 `/lib/media/types.ts` 中修改）：

### 支持的文件类型

**图片：**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**视频：**
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)
- QuickTime (.mov)

**文档：**
- PDF (.pdf)
- Text (.txt)
- Word (.doc, .docx)

### 文件大小限制

- 最大文件大小：**50MB**
- 可以在 `DEFAULT_UPLOAD_CONFIG` 中修改

## 使用方法

### 1. 媒体库页面

访问 `/media` 查看媒体库：

- 上传新文件（支持拖拽）
- 查看所有已上传的媒体
- 按类型筛选（全部/图片/视频）
- 预览和管理媒体文件
- 删除不需要的文件

### 2. 文章编辑器

访问 `/articles` 创建文章：

- 使用富文本编辑器编写内容
- 点击"插入媒体"按钮从媒体库选择文件
- 支持 Markdown 格式
- 实时预览功能
- 保存和发布文章

### 3. 在自己的组件中使用

#### 上传组件

```tsx
import MediaUpload from '@/components/media/MediaUpload'

<MediaUpload
  onUploadComplete={(file) => console.log('Uploaded:', file)}
  onUploadError={(error) => console.error('Error:', error)}
  multiple={true}
/>
```

#### 图片预览

```tsx
import ImagePreview from '@/components/media/ImagePreview'

<ImagePreview
  src="https://example.com/image.jpg"
  alt="Description"
  onDelete={() => handleDelete()}
  showControls={true}
/>
```

#### 视频嵌入

```tsx
import VideoEmbed from '@/components/media/VideoEmbed'

<VideoEmbed
  src="https://example.com/video.mp4"
  title="Video Title"
  onDelete={() => handleDelete()}
  showControls={true}
/>
```

#### 媒体库

```tsx
import MediaGallery from '@/components/media/MediaGallery'

<MediaGallery
  onSelectMedia={(file) => console.log('Selected:', file)}
  selectable={true}
/>
```

#### 内容编辑器

```tsx
import ContentEditor from '@/components/editor/ContentEditor'

<ContentEditor
  initialContent=""
  onChange={(content) => setContent(content)}
  onInsertMedia={() => setShowMediaPicker(true)}
  placeholder="开始编写..."
/>
```

## API 参考

### 上传函数

```typescript
import { uploadToStorage } from '@/lib/media/upload'

const result = await uploadToStorage(
  file,              // File object
  'image',           // MediaType: 'image' | 'video' | 'document'
  (progress) => {    // Progress callback
    console.log(`${progress}%`)
  }
)

if (result.success) {
  console.log('File uploaded:', result.file)
} else {
  console.error('Upload failed:', result.error)
}
```

### 验证函数

```typescript
import { validateFile } from '@/lib/media/validation'

const validation = validateFile(file)

if (validation.valid) {
  console.log('File is valid, type:', validation.mediaType)
} else {
  console.error('Validation failed:', validation.error)
}
```

### 列出文件

```typescript
import { listMediaFiles } from '@/lib/media/upload'

const files = await listMediaFiles('image', 50) // type, limit
```

### 删除文件

```typescript
import { deleteFromStorage } from '@/lib/media/upload'

const success = await deleteFromStorage(filePath)
```

## 自定义配置

### 修改上传限制

编辑 `/lib/media/types.ts`：

```typescript
export const DEFAULT_UPLOAD_CONFIG: MediaUploadConfig = {
  maxFileSize: 100 * 1024 * 1024, // 改为 100MB
  allowedImageTypes: ['image/jpeg', 'image/png'], // 只允许 JPEG 和 PNG
  allowedVideoTypes: ['video/mp4'], // 只允许 MP4
  allowedDocumentTypes: []
}
```

### 自定义样式

所有组件都接受 `className` 属性，可以使用 Tailwind CSS 类进行自定义样式。

## 故障排除

### 上传失败

1. **检查 Supabase Storage Bucket**
   - 确认 `media` bucket 已创建
   - 确认 bucket 是公开的或有正确的访问策略

2. **检查环境变量**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **检查文件大小和类型**
   - 确认文件未超过 50MB
   - 确认文件类型被支持

### 图片/视频无法显示

1. **检查 CORS 设置**
   - Supabase Storage 默认配置了 CORS，但如果有问题，在 Dashboard 中检查

2. **检查 URL**
   - 确认 URL 格式正确
   - 确认文件确实存在于 Storage 中

### 删除失败

1. **检查权限**
   - 确认用户有权限删除文件
   - 检查 Storage Policies

## 最佳实践

1. **图片优化**
   - 上传前压缩大图片
   - 使用 WebP 格式以获得更好的压缩

2. **视频处理**
   - 对于大视频，考虑使用专门的视频托管服务
   - 提供多种分辨率选项

3. **安全性**
   - 实施用户认证
   - 设置适当的 Storage Policies
   - 验证所有上传的文件

4. **性能**
   - 使用懒加载加载媒体
   - 实施分页减少初始加载
   - 考虑使用 CDN

## 后续改进建议

- [ ] 添加图片裁剪和编辑功能
- [ ] 实现视频转码
- [ ] 添加批量上传和删除
- [ ] 实现搜索和标签功能
- [ ] 添加使用统计和配额管理
- [ ] 集成 CDN 加速
- [ ] 添加图片/视频水印
- [ ] 实现更丰富的编辑器（如 TipTap 或 Slate）
