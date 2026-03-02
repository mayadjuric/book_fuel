import { useEffect, useState } from 'react'
import { parseISO, format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ITask } from './Task'

interface CalendarEvent {
  id: string
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  htmlLink?: string
}

interface CalendarImportModalProps {
  isOpen: boolean
  token: string
  onClose: () => void
  onImport: (tasks: ITask[]) => void
}

export function CalendarImportModal({
  isOpen,
  token,
  onClose,
  onImport,
}: CalendarImportModalProps) {
  const EVALUATION_TYPES = ['Assignment', 'Exam', 'Project', 'Reading'] as const
  type EvalType = (typeof EVALUATION_TYPES)[number]

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Record<string, { difficulty: number; type: EvalType }>>({})
  const [error, setError] = useState<string | null>(null)
  const [suggestingTypes, setSuggestingTypes] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isOpen) return
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('http://localhost:5100/api/calendar/events', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch calendar events')
        }
        const data = await res.json()
        setEvents(data.events || [])
      } catch (e) {
        console.error(e)
        setError('We could not load your upcoming Google Calendar events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isOpen, token])

  const toggle = (id: string) => {
    setSelected((s) => {
      const copy = { ...s }
      if (copy[id]) delete copy[id]
      else copy[id] = { difficulty: 2, type: 'Assignment' }
      return copy
    })
  }

  const handleSuggestTypes = async () => {
    const selectedEvents = events.filter((ev) => selected[ev.id])
    if (selectedEvents.length === 0) return
    setSuggestingTypes(true)
    try {
      const res = await fetch('http://localhost:5100/api/evaluations/suggest-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          names: selectedEvents.map((ev) => ev.summary || 'Untitled event'),
        }),
      })
      if (!res.ok) return
      const data = await res.json()
      const suggestions: Record<string, EvalType> = data.suggestions || {}
      setSelected((s) => {
        const next = { ...s }
        for (const ev of selectedEvents) {
          const name = ev.summary || 'Untitled event'
          const suggested = suggestions[name]
          if (suggested && EVALUATION_TYPES.includes(suggested)) {
            if (next[ev.id]) next[ev.id] = { ...next[ev.id], type: suggested }
          }
        }
        return next
      })
    } catch (e) {
      console.error('Failed to suggest types:', e)
    } finally {
      setSuggestingTypes(false)
    }
  }

  const handleImport = async () => {
    const tasksToImport: ITask[] = []
    for (const ev of events) {
      if (!selected[ev.id]) continue
      const dueRaw = ev.start?.dateTime ?? ev.start?.date
      const due = dueRaw ? new Date(dueRaw).toISOString() : new Date().toISOString()
      const payload = {
        start_date: new Date().toISOString(),
        due_date: due,
        name: ev.summary || 'Imported event',
        type: selected[ev.id].type,
        difficulty: selected[ev.id].difficulty,
      }
      const res = await fetch(`http://localhost:5100/api/evaluations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        tasksToImport.push({
          name: payload.name,
          due_date: new Date(payload.due_date),
          type: payload.type,
          difficulty: payload.difficulty,
        } as unknown as ITask)
      } else {
		const errRes = await res.json()

		console.error('Failed to import event:', errRes.message || res.statusText)
	  }
    }
    onImport(tasksToImport)
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from Google Calendar</DialogTitle>
          <DialogDescription>
            Choose events to turn into evaluations. Set a type and stress level for each event, or use the suggestion to auto-detect types from names.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {events.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {Object.keys(selected).length} selected
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggestTypes}
                disabled={Object.keys(selected).length === 0 || suggestingTypes}
              >
                {suggestingTypes ? 'Suggesting…' : 'Suggest types from names'}
              </Button>
            </div>
          )}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-md border bg-muted/40"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-md border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              No upcoming events found in your connected Google Calendar.
            </div>
          ) : (
            events.map((ev) => {
              const isSelected = !!selected[ev.id]
              const raw = ev.start?.dateTime ?? ev.start?.date ?? ''
              let startText = raw
              try {
                if (raw) {
                  const dt = parseISO(raw)
                  startText = /T/.test(raw) ? format(dt, 'PPP p') : format(dt, 'PPP')
                }
              } catch {
                startText = raw
              }

              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggle(ev.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle(ev.id)
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition hover:bg-accent/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${ev.summary ?? 'event'} for import`}
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggle(ev.id)
                        }}
                        className="h-4 w-4 rounded border-muted-foreground accent-primary"
                      />
                      <span className="text-sm font-medium leading-tight">
                        {ev.summary || 'Untitled event'}
                      </span>
                    </div>
                    <span className="pl-6 text-xs text-muted-foreground">
                      {startText || 'No start date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-xs text-muted-foreground">
                        Type
                      </label>
                      <select
                        aria-label={`Type for ${ev.summary ?? 'event'}`}
                        value={selected[ev.id]?.type ?? 'Assignment'}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [ev.id]: { ...s[ev.id], type: e.target.value as EvalType },
                          }))
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={!isSelected}
                        className="h-8 rounded-md border bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        {EVALUATION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-xs text-muted-foreground">
                        Stress
                      </label>
                      <select
                        aria-label={`Stress level for ${ev.summary ?? 'event'}`}
                        value={selected[ev.id]?.difficulty ?? 2}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [ev.id]: { ...s[ev.id], difficulty: Number(e.target.value) },
                          }))
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={!isSelected}
                        className="h-8 rounded-md border bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <option value={1}>1 - Easy</option>
                        <option value={1.5}>1.5</option>
                        <option value={2}>2 - Moderate</option>
                        <option value={2.5}>2.5</option>
                        <option value={3}>3</option>
                        <option value={3.5}>3.5</option>
                        <option value={4}>4 - Heavy</option>
                        <option value={4.5}>4.5</option>
                        <option value={5}>5 - Very heavy</option>
                      </select>
                    </div>
                  </div>
                </button>
              )
            })
          )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={Object.keys(selected).length === 0 || loading}
          >
            Import selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
