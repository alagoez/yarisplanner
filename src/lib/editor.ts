import { createContext, useContext } from 'react'
import type { Item, Kind, Module, Repeat } from './items'

/** Yeni kayıt sayfası açılırken hazır gelecek seçimler (ör. Özel Günler'den: her yıl, 1 gün önce). */
export type EditorPreset = { module?: Module; kind?: Kind; repeat?: Repeat | null; reminders?: number[] }

/** Kayıt ekleme / düzenleme sayfasını her ekrandan açmak için. Kayıt verilmezse yeni kayıt açılır. */
export const EditorContext = createContext<{ open: (item?: Item, preset?: EditorPreset) => void }>({ open: () => {} })

export function useEditor() {
  return useContext(EditorContext)
}
