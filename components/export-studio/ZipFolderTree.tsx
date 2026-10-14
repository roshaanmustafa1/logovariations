'use client'

import React, { useState } from 'react'
import {
  Folder,
  FolderOpen,
  FileCode,
  FileImage,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Archive,
} from 'lucide-react'
import { FolderTreeNode } from '@/features/export/planner'

interface ZipFolderTreeProps {
  rootNode: FolderTreeNode
  totalFiles: number
}

function getFileIcon(filename: string) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.svg')) return <FileCode className="size-3.5 text-amber-500" />
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.webp') || lower.endsWith('.ico'))
    return <FileImage className="size-3.5 text-blue-500" />
  if (lower.endsWith('.pdf')) return <FileText className="size-3.5 text-red-500" />
  if (lower.endsWith('.json')) return <FileJson className="size-3.5 text-emerald-500" />
  return <FileText className="size-3.5 text-gray-400" />
}

function TreeNode({ node, depth = 0 }: { node: FolderTreeNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2)

  if (!node.isFolder) {
    return (
      <div
        className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[#F8F7F4] text-xs text-[#252525] transition-colors"
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {getFileIcon(node.name)}
        <span className="font-mono text-[11px] truncate">{node.name}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-[#F8F7F4] text-xs font-semibold text-[#252525] cursor-pointer transition-colors select-none"
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        <span className="text-[#A09D96]">
          {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </span>
        {isOpen ? (
          <FolderOpen className="size-4 text-[#FF650B]" />
        ) : (
          <Folder className="size-4 text-[#FF650B]" />
        )}
        <span className="truncate">{node.name}</span>
        {node.children && (
          <span className="text-[10px] text-[#A09D96] font-normal ml-auto">
            {node.children.length}
          </span>
        )}
      </div>

      {isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <TreeNode key={child.path || child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ZipFolderTree({ rootNode, totalFiles }: ZipFolderTreeProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E2]">
        <div className="flex items-center gap-2">
          <Archive className="size-4 text-[#FF650B]" />
          <h2 className="text-base font-semibold text-[#252525]">
            ZIP Archive Structure Preview
          </h2>
        </div>
        <span className="text-xs font-mono font-medium text-[#737373] bg-[#F8F7F4] px-2.5 py-1 rounded-lg border border-[#E8E6E2]">
          {totalFiles} files planned
        </span>
      </div>

      <div className="bg-[#F8F7F4]/60 border border-[#E8E6E2] rounded-xl p-3 max-h-96 overflow-y-auto">
        <TreeNode node={rootNode} depth={0} />
      </div>
    </div>
  )
}
