import { PollContainer } from "@/app/components/PollContainer";

export default function QuickPollUI() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">QuickPoll — Live</h1>
      </header>

      <PollContainer />
    </main>
  );
}
