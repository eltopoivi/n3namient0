"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_KINDS, SPORTS } from "@/lib/domain/sports";

import { createEventAction } from "./actions";

export function EventForm() {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("carrera");
  const [sport, setSport] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [targetNotes, setTargetNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createEventAction({
        title,
        kind,
        sport: sport || null,
        event_date: eventDate,
        location: location || null,
        target_notes: targetNotes || null,
      });
      if (!res.ok) setError(res.error);
      else {
        setTitle("");
        setLocation("");
        setTargetNotes("");
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-md border p-3">
      <div className="col-span-2 flex flex-col gap-1">
        <Label>Título</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Tipo</Label>
        <Select value={kind} onChange={(e) => setKind(e.target.value)}>
          {EVENT_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label>Deporte</Label>
        <Select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">—</option>
          {SPORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label>Fecha</Label>
        <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Ubicación</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <Label>Objetivo</Label>
        <Textarea rows={2} value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)} />
      </div>
      {error ? <p className="col-span-2 text-sm text-destructive">{error}</p> : null}
      <div className="col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Añadir"}
        </Button>
      </div>
    </form>
  );
}
