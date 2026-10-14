'use client';

import { createContext, useContext, useId, useState } from 'react';
import type { ReactNode } from 'react';

import { copy } from '@/lib/site';

type Study = { contribution: string; decision: string; limitation: string };
type NotesState = { open: boolean; toggle: () => void; panelId: string };

const NotesContext = createContext<NotesState | null>(null);

function useNotes(): NotesState {
  const state = useContext(NotesContext);
  if (!state)
    throw new Error(
      'EngineeringNotes parts must be rendered inside <EngineeringNotes>.',
    );
  return state;
}

/**
 * Shares the open state between the toggle, which sits in the card's button
 * row, and the panel, which opens below the card body. The card itself stays
 * a server component; only these two leaves run on the client.
 */
export function EngineeringNotes({
  initialOpen = false,
  children,
}: {
  initialOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initialOpen);
  const panelId = useId();
  return (
    <NotesContext.Provider
      value={{ open, toggle: () => setOpen((value) => !value), panelId }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function EngineeringNotesToggle() {
  const { open, toggle, panelId } = useNotes();
  return (
    <button
      type="button"
      className="notes-toggle"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={toggle}
    >
      {open ? copy.hideNotes : copy.engineeringNotes} {open ? '−' : '+'}
    </button>
  );
}

export function EngineeringNotesPanel({ study }: { study: Study }) {
  const { open, panelId } = useNotes();
  return (
    <dl id={panelId} className="engineering-notes" hidden={!open}>
      {(
        [
          ['contribution', copy.contribution],
          ['decision', copy.decision],
          ['limitation', copy.limitation],
        ] as const
      ).map(([field, label]) => (
        <div key={field}>
          <dt
            className={`label ${field === 'limitation' ? 'venue' : 'accent'}`}
          >
            {label}
          </dt>
          <dd>{study[field]}</dd>
        </div>
      ))}
    </dl>
  );
}
