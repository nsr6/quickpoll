"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrashIcon } from "@/components/ui/icons/oi-trash";
import { HeartIcon } from "@/components/ui/icons/oi-heart";

export type Option = { id: number; text: string; votes: number };
export type Poll = { id: number; question: string; options: Option[]; likes: number };

const totalVotes = (p: Poll) => p.options.reduce((s, o) => s + o.votes, 0) || 1;

import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
import { PollEditForm } from "./PollEditForm";

export function PollCard({
  poll,
  onVote,
  onLike,
  onDelete,
  onEdit,
}: {
  poll: Poll;
  onVote: (optId: number) => void;
  onLike: () => void;
  onDelete: () => void;
  onEdit?: (poll: Partial<Poll>) => void;
}) {
  const total = totalVotes(poll);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Update token on mount and when poll.id changes
    React.useEffect(() => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem(`poll_token_${poll.id}`);
        setToken(storedToken);
      
        // Listen for localStorage changes
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === `poll_token_${poll.id}`) {
            setToken(e.newValue);
          }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }
      // Also pick up token if parent supplies it on the poll object (e.g. right after creation)
    if (poll && (poll as any).token) {
      setToken((poll as any).token as string);
    }
    }, [poll.id, (poll as any).token]);

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">{poll.question}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <span>{poll.options.length} options</span>
              <span className="text-gray-300">•</span>
              <span>{total} votes</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLike} 
              aria-label="Like poll"
              className="hover:bg-pink-50 hover:text-pink-600 transition-colors"
            >
              <HeartIcon size={28} className="mr-2 text-pink-500" />
              <span className="text-sm font-medium">{poll.likes}</span>
            </Button>
            {token && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDelete} 
                  aria-label="Delete poll"
                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <TrashIcon size={24} className="" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit poll"
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {poll.options.map((opt) => {
          const pct = Math.round((opt.votes / total) * 100);
          return (
            <div key={opt.id} className="group relative">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 items-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{opt.text}</div>
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                      {opt.votes} votes ({pct}%)
                    </Badge>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={pct} 
                      className="h-2 bg-gray-100" 
                    />
                  </div>
                </div>

                <div className="sm:pl-4">
                  <Button 
                    onClick={() => onVote(opt.id)}
                    size="sm"
                    className="w-full sm:w-auto hover:shadow-sm transition-shadow"
                  >
                    Vote
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>

      {token && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg w-full p-6">
            <PollEditForm
              poll={poll}
              loading={editLoading}
              onCancel={() => setEditOpen(false)}
              onSave={async (data) => {
                setEditLoading(true);
                try {
                  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
                  const res = await fetch(`${apiBase}/polls/${poll.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, token }),
                  });
                  if (!res.ok) throw new Error("Edit failed");
                  setEditOpen(false);
                  const result = await res.json();
                  if (onEdit && result.poll) onEdit(result.poll);
                } catch (e) {
                  alert("Failed to edit poll");
                } finally {
                  setEditLoading(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}