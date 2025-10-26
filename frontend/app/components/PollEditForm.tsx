"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons/oi-trash";
import type { Poll } from "./PollCard";

type Option = { id?: number; text: string; votes?: number };

export function PollEditForm({ poll, onSave, onCancel, loading }: {
  poll: Poll;
  onSave: (data: { question: string; options: Option[] }) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [question, setQuestion] = useState(poll.question);
  const [options, setOptions] = useState<Option[]>(poll.options.map(o => ({ id: o.id, text: o.text, votes: o.votes })));

  const addOption = () => setOptions(s => [...s, { text: "" }]);
  const updateOption = (i: number, val: string) => setOptions(s => s.map((x, idx) => idx === i ? { ...x, text: val } : x));
  const removeOption = (i: number) => setOptions(s => s.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!question.trim() || options.filter(o => o.text.trim()).length < 2) {
      alert("Please enter a question and at least 2 options");
      return;
    }
    onSave({ question: question.trim(), options: options.filter(o => o.text.trim()) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Question</label>
        <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Edit poll question" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Options</label>
        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input value={opt.text} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
              <Button variant="ghost" onClick={() => removeOption(i)} disabled={options.length <= 2} title="Remove option">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={addOption} size="sm" className="mt-2">Add option</Button>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={handleSave} disabled={loading}>Save</Button>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
    </div>
  );
}
