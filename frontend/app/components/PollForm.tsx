"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/icons/oi-trash";

type Option = { id: number; text: string; votes: number };
type Poll = { id: number; question: string; options: Option[]; likes: number };

export function PollForm({ onCreated }: { onCreated?: (id: number, token: string) => void }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const addOption = () => setOptions((s) => [...s, ""]);
  const updateOption = (i: number, val: string) => setOptions((s) => s.map((x, idx) => (idx === i ? val : x)));
  const removeOption = (i: number) => setOptions((s) => s.filter((_, idx) => idx !== i));

  const submit = async () => {
    const cleanOpts = options.map((t) => t.trim()).filter((t) => t.length > 0);
    if (!question.trim() || cleanOpts.length < 2) {
      alert("Please enter a question and at least 2 options");
      return;
    }

    const payload = { question: question.trim(), options: cleanOpts.map((text) => ({ text })) };
    try {
      const res = await fetch(`${apiBase}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      // Store token in localStorage for ownership
      if (data.poll_id && data.token) {
        localStorage.setItem(`poll_token_${data.poll_id}`, data.token);
        // Notify parent in the same tab so UI can pick up the token immediately
        if (onCreated) onCreated(data.poll_id, data.token);
      }
      // Clear the form - poll will be added via WebSocket
      setQuestion("");
      setOptions(["", ""]);
    } catch (e) {
      console.error(e);
      alert("Failed to create poll");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-900 mb-2">
            Question
          </label>
          <Input 
            id="question"
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            placeholder="What would you like to ask?" 
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Options
          </label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="group flex gap-2">
                <Input 
                  value={opt} 
                  onChange={(e) => updateOption(i, e.target.value)} 
                  placeholder={`Option ${i + 1}`}
                  className="w-full"
                />
                <Button 
                  variant="ghost" 
                  onClick={() => removeOption(i)} 
                  disabled={options.length <= 2} 
                  title="Remove option"
                  className="shrink-0 hover:bg-red-50 hover:text-red-600 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button 
          variant="outline" 
          onClick={addOption}
          size="sm"
          className="text-sm"
        >
          Add option
        </Button>
        <Button 
          onClick={submit}
          className="ml-auto"
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
        >
          Create Poll
        </Button>
      </div>
    </div>
  );
}