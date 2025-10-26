"use client";

import React, { useEffect, useState } from "react";
import { PollCard } from "@/app/components/PollCard";
import { PollForm } from "@/app/components/PollForm";

type Option = { id: number; text: string; votes: number };
type Poll = { id: number; question: string; options: Option[]; likes: number };

export function PollContainer() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const [polls, setPolls] = useState<Poll[]>([]);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/polls`);
        const data = await r.json();
        setPolls(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [apiBase]);

  // WebSocket updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = process.env.NEXT_PUBLIC_WS_URL ?? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'vote') {
          setPolls((prev) => prev.map((p) => p.id === msg.poll.id ? { ...p, options: p.options.map((o) => { const u = msg.poll.options.find((x:any)=>x.id===o.id); return u ? { ...o, votes: u.votes } : o; }) } : p));
        } else if (msg.type === 'like') {
          setPolls((prev) => prev.map((p) => p.id === msg.poll.id ? { ...p, likes: msg.poll.likes } : p));
        } else if (msg.type === 'poll_created') {
          setPolls((prev) => [msg.poll, ...prev]);
        }
      } catch (e) { console.error(e); }
    };
    ws.onopen = () => console.log('ws open');
    ws.onclose = () => console.log('ws closed');
    return () => ws.close();
  }, []);

  const handleVote = async (pollId: number, optId: number) => {
    // optimistic update
    setPolls((prev) => prev.map((p) => p.id === pollId ? { ...p, options: p.options.map((o) => o.id === optId ? { ...o, votes: o.votes + 1 } : o) } : p));
    try {
      await fetch(`${apiBase}/polls/${pollId}/vote?option_id=${optId}`, { method: 'POST' });
    } catch (e) { console.error(e); }
  };

  const handleLike = async (pollId: number) => {
    setPolls((prev) => prev.map((p) => p.id === pollId ? { ...p, likes: p.likes + 1 } : p));
    try { await fetch(`${apiBase}/polls/${pollId}/like`, { method: 'POST' }); } catch (e) { console.error(e); }
  };

  const handleDelete = async (pollId: number) => {
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
    try { await fetch(`${apiBase}/polls/${pollId}`, { method: 'DELETE' }); } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>
            <PollForm onCreate={(p) => setPolls((s) => [p, ...s])} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-2">Active Polls</h2>
          <p className="text-gray-500 text-sm mb-4">Vote and interact with ongoing polls</p>
          <div className="space-y-6">
            {polls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No polls available. Create one to get started!</p>
              </div>
            ) : (
              polls.map((p) => (
                <PollCard 
                  key={p.id} 
                  poll={p} 
                  onVote={(optId) => handleVote(p.id, optId)} 
                  onLike={() => handleLike(p.id)} 
                  onDelete={() => handleDelete(p.id)} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}