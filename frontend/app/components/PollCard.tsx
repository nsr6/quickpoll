"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrashIcon } from "@/components/ui/icons/oi-trash";
import { HeartIcon } from "@/components/ui/icons/oi-heart";

type Option = { id: number; text: string; votes: number };
type Poll = { id: number; question: string; options: Option[]; likes: number };

const totalVotes = (p: Poll) => p.options.reduce((s, o) => s + o.votes, 0) || 1;

export function PollCard({
  poll,
  onVote,
  onLike,
  onDelete,
}: {
  poll: Poll;
  onVote: (optId: number) => void;
  onLike: () => void;
  onDelete: () => void;
}) {
  const total = totalVotes(poll);

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
              <HeartIcon className="mr-1.5 h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">{poll.likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete} 
              aria-label="Delete poll"
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
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
    </Card>
  );
}