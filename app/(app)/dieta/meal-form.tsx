"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_SLOTS } from "@/lib/domain/sports";

import { createMealAction } from "./actions";

export function MealForm({ defaultDate }: { defaultDate: string }) {
  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState("comida");
  const [description, setDescription] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createMealAction({
        date,
        slot,
        description: description || null,
        kcal: kcal || null,
        protein_g: protein || null,
        carbs_g: carbs || null,
        fat_g: fat || null,
        fiber_g: fiber || null,
      });
      if (!res.ok) setError(res.error);
      else {
        setDescription("");
        setKcal("");
        setProtein("");
        setCarbs("");
        setFat("");
        setFiber("");
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-md border p-3">
      <div className="col-span-2 flex flex-col gap-1">
        <Label>Fecha</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <Label>Momento</Label>
        <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
          {MEAL_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <Label>Descripción</Label>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Lo que has comido"
        />
      </div>
      <NumField label="kcal" value={kcal} setValue={setKcal} />
      <NumField label="Proteína (g)" value={protein} setValue={setProtein} />
      <NumField label="Carbs (g)" value={carbs} setValue={setCarbs} />
      <NumField label="Grasa (g)" value={fat} setValue={setFat} />
      <NumField label="Fibra (g)" value={fiber} setValue={setFiber} />
      {error ? <p className="col-span-2 text-sm text-destructive">{error}</p> : null}
      <div className="col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Añadir comida"}
        </Button>
      </div>
    </form>
  );
}

function NumField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
