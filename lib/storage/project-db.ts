import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { ProjectData } from '@/types/brand'

interface LogoPackDBSchema extends DBSchema {
  projects: {
    key: string
    value: ProjectData
  }
}

const DB_NAME = 'logopack_studio_db'
const DB_VERSION = 1
const ACTIVE_PROJECT_KEY = 'active_project'

let dbPromise: Promise<IDBPDatabase<LogoPackDBSchema>> | null = null

function getDB(): Promise<IDBPDatabase<LogoPackDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<LogoPackDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveProjectToDB(project: ProjectData): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const db = await getDB()
    await db.put('projects', {
      ...project,
      id: ACTIVE_PROJECT_KEY,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Failed to save project to IndexedDB:', error)
  }
}

export async function loadProjectFromDB(): Promise<ProjectData | null> {
  if (typeof window === 'undefined') return null
  try {
    const db = await getDB()
    const project = await db.get('projects', ACTIVE_PROJECT_KEY)
    return project || null
  } catch (error) {
    console.error('Failed to load project from IndexedDB:', error)
    return null
  }
}

export async function clearProjectDB(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const db = await getDB()
    await db.delete('projects', ACTIVE_PROJECT_KEY)
  } catch (error) {
    console.error('Failed to clear project in IndexedDB:', error)
  }
}

export function exportProjectToJson(project: ProjectData): void {
  const dataStr = JSON.stringify(project, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.slug || 'logopack'}-backup.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
