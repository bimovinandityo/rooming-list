"use client";

import { Mail, Star } from "lucide-react";
import { cn } from "@/shared/utils";

interface RatingQuestion {
  id: string;
  prompt: string;
  /** Distribution from 5★ down to 1★, summing to 100 */
  distribution: [number, number, number, number, number];
  responseCount: number;
}

interface CommentResponse {
  id: string;
  authorName: string;
  authorInitials: string;
  comment: string;
}

interface CommentQuestion {
  id: string;
  prompt: string;
  responses: CommentResponse[];
}

const TOTAL_PARTICIPANTS: number = 30;
const NOT_ANSWERED: number = 10;

const RATING_QUESTIONS: RatingQuestion[] = [
  {
    id: "q1",
    prompt: "Q1: How would you rate the overall organization of the event?",
    distribution: [50, 20, 10, 10, 10],
    responseCount: 10,
  },
  {
    id: "q2",
    prompt: "Q2: Are you satisfied with the quality of the accommodation?",
    distribution: [50, 20, 10, 10, 10],
    responseCount: 10,
  },
  {
    id: "q3",
    prompt: "Q3: Would you recommend this event to a colleague?",
    distribution: [60, 25, 10, 5, 0],
    responseCount: 10,
  },
];

const COMMENT_QUESTION: CommentQuestion = {
  id: "c1",
  prompt: "Comments",
  responses: [
    {
      id: "r1",
      authorName: "Marie Dubois",
      authorInitials: "MD",
      comment:
        "In a world where dreams come to life, stars dance to the rhythm of the waves. Every breath of wind whispers forgotten secrets, and the flowers bloom under a velvet sky.",
    },
    {
      id: "r2",
      authorName: "Lucas Bernard",
      authorInitials: "LB",
      comment:
        "An exceptional experience from start to finish. The team was remarkably attentive and the overall atmosphere was perfect. Can't wait to come back next year!",
    },
    {
      id: "r3",
      authorName: "Sophie Martin",
      authorInitials: "SM",
      comment:
        "The activities offered were varied and interesting. Some room for improvement in the timing between sessions, but overall a great success.",
    },
  ],
};

function avgFromDistribution(d: RatingQuestion["distribution"]): number {
  // d is [pct of 5★, pct of 4★, …, pct of 1★]
  const total = d.reduce((s, n) => s + n, 0);
  if (total === 0) return 0;
  const weighted = d[0] * 5 + d[1] * 4 + d[2] * 3 + d[3] * 2 + d[4] * 1;
  return Math.round((weighted / total) * 10) / 10;
}

export function FeedbackView() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-8 py-6 flex flex-col gap-5">
        {/* Section toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Participant feedback</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {NOT_ANSWERED} participant{NOT_ANSWERED !== 1 ? "s" : ""} haven&rsquo;t responded yet
            </span>
            <button className="flex items-center gap-2 text-sm bg-gray-900 text-white px-3.5 py-2 rounded-md hover:bg-gray-700 transition-colors">
              <Mail size={13} />
              Send a reminder email
            </button>
          </div>
        </div>

        {/* Rating questions */}
        {RATING_QUESTIONS.map((q) => (
          <RatingCard key={q.id} q={q} />
        ))}

        {/* Comments */}
        <CommentSection q={COMMENT_QUESTION} />

        <p className="text-xs text-gray-400 pb-2">
          {TOTAL_PARTICIPANTS - NOT_ANSWERED} of {TOTAL_PARTICIPANTS} participants responded.
        </p>
      </div>
    </div>
  );
}

function RatingCard({ q }: { q: RatingQuestion }) {
  const avg = avgFromDistribution(q.distribution);
  return (
    <article className="rounded-lg border border-gray-200 bg-white px-6 py-5">
      <header className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{q.prompt}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {q.responseCount} response{q.responseCount !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="flex items-center gap-8">
        {/* Histogram */}
        <div className="flex-1 flex flex-col gap-2">
          {([5, 4, 3, 2, 1] as const).map((star, i) => {
            const pct = q.distribution[i];
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-3 text-xs font-medium text-gray-600 tabular-nums">{star}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-full transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right">
                  <span className="inline-block text-[11px] font-medium text-gray-700 px-2 py-0.5 border border-gray-200 rounded tabular-nums">
                    {pct}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Average + stars */}
        <div className="w-44 flex flex-col items-center shrink-0">
          <span className="text-4xl font-semibold text-gray-900 tabular-nums">
            {avg.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={20}
                strokeWidth={1.25}
                className={cn(n <= Math.round(avg) ? "text-slate-800" : "text-gray-300")}
                fill={n <= Math.round(avg) ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function CommentSection({ q }: { q: CommentQuestion }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white px-6 py-5">
      <header className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{q.prompt}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {q.responses.length} response{q.responses.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {q.responses.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50/40 px-4 py-3"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 shrink-0">
              {r.authorInitials}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
