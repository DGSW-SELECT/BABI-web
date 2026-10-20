import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

type InputViewportState = { isEditing: boolean; height: number; offsetTop: number }

function isTypingField(tagName: string, inputType = 'text'): boolean {
  if (tagName.toLowerCase() === 'textarea') return true
  return tagName.toLowerCase() === 'input'
    && ['text', 'number', 'search', 'email', 'tel', 'url', 'password'].includes(inputType.toLowerCase())
}

function isViewportReduced(baselineHeight: number, visibleHeight: number, scale = 1): boolean {
  return Math.abs(scale - 1) < 0.01
    && baselineHeight - visibleHeight > Math.max(80, baselineHeight * 0.15)
}

function getActiveField(root: HTMLElement | null): HTMLInputElement | HTMLTextAreaElement | null {
  const active = document.activeElement
  if (!root || !active || !root.contains(active)) return null
  if (!(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) return null
  return !active.disabled && !active.readOnly && isTypingField(active.tagName, active.type) ? active : null
}

export function useInputViewport(containerRef: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<InputViewportState>({ isEditing: false, height: 0, offsetTop: 0 })

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const visual = window.visualViewport
    let baselineHeight = visual?.height ?? window.innerHeight
    let baselineWidth = window.innerWidth
    let lastField: HTMLInputElement | HTMLTextAreaElement | null = null
    let editingForFocus = false
    let sawReducedViewport = false
    let measureFrame = 0
    let scrollFrame = 0

    function keepFieldVisible(field: HTMLElement) {
      const scroller = field.closest<HTMLElement>('[data-input-scroll-container]')
      if (!scroller) return
      const fieldBox = field.getBoundingClientRect()
      const scrollBox = scroller.getBoundingClientRect()
      const visibleTop = scrollBox.top + 24
      if (fieldBox.bottom > scrollBox.bottom - 24) {
        scroller.scrollTop += fieldBox.bottom - scrollBox.bottom + 24
      } else if (fieldBox.top < visibleTop) {
        scroller.scrollTop -= visibleTop - fieldBox.top
      }
    }

    function measure() {
      measureFrame = 0
      const height = Math.max(1, Math.round(visual?.height ?? window.innerHeight))
      const offsetTop = Math.max(0, Math.round(visual?.offsetTop ?? 0))
      const scale = visual?.scale ?? 1
      const field = getActiveField(root)

      if (baselineWidth !== window.innerWidth) {
        baselineWidth = window.innerWidth
        baselineHeight = height
        sawReducedViewport = false
      }
      if (!field) {
        editingForFocus = false
        sawReducedViewport = false
        lastField = null
        if (!isViewportReduced(baselineHeight, height, scale)) baselineHeight = height
      } else {
        if (lastField !== field) {
          lastField = field
          editingForFocus = true
          sawReducedViewport = false
        }
        if (isViewportReduced(baselineHeight, height, scale)) {
          sawReducedViewport = true
          editingForFocus = true
        } else if (sawReducedViewport) {
          sawReducedViewport = false
          editingForFocus = false
          baselineHeight = height
        }
      }

      const isEditing = Boolean(field && editingForFocus)
      setViewport((previous) => previous.isEditing === isEditing && previous.height === height && previous.offsetTop === offsetTop
        ? previous : { isEditing, height, offsetTop })
      cancelAnimationFrame(scrollFrame)
      if (isEditing && field) scrollFrame = requestAnimationFrame(() => keepFieldVisible(field))
    }

    function schedule() {
      cancelAnimationFrame(measureFrame)
      measureFrame = requestAnimationFrame(measure)
    }

    function onPointerDown(event: PointerEvent) {
      if (event.target === getActiveField(root)) {
        editingForFocus = true
        schedule()
      }
    }

    function onFocusIn() {
      lastField = null
      sawReducedViewport = false
      schedule()
    }

    function onFocusOut() {
      lastField = null
      sawReducedViewport = false
      editingForFocus = false
      schedule()
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    root.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', schedule)
    visual?.addEventListener('resize', schedule)
    visual?.addEventListener('scroll', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(measureFrame)
      cancelAnimationFrame(scrollFrame)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      root.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
      visual?.removeEventListener('resize', schedule)
      visual?.removeEventListener('scroll', schedule)
    }
  }, [containerRef])

  const finishEditing = useCallback(() => {
    getActiveField(containerRef.current)?.blur()
    setViewport((previous) => ({ ...previous, isEditing: false }))
  }, [containerRef])

  return { ...viewport, finishEditing }
}
