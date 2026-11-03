import { createContext, useContext } from 'react'
import type { Item } from './items'

/** Kayıt ekleme / düzenleme sayfasını her ekrandan açmak için. Kayıt verilmezse yeni kayıt açılır. */
export const EditorContext = createContext<{ open: (item?: Item) => void }>({ open: () => {} })

export function useEditor() {
  return useContext(EditorContext)
}
