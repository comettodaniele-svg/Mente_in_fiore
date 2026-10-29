// Il questionario sulle situazioni quotidiane: una domanda per pagina, risposte grandi.
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTIONS, type Answer } from '../data/questionnaire';
import { Dots, Listen } from '../components/ui';

export function QuestionnaireFlow({
  initial = {},
  onDone,
  onExit,
}: {
  initial?: Record<string, Answer>;
  onDone: (a: Record<string, Answer>) => void;
  onExit: () => void;
}) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(initial);
  const q = QUESTIONS[i];
  const current = answers[q.id];

  function answer(a: Answer) {
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    if (i + 1 < QUESTIONS.length) setTimeout(() => setI(i + 1), 220);
    else setTimeout(() => onDone(next), 220);
  }

  const opts: { a: Answer; label: string }[] = [
    { a: 0, label: 'Mai' },
    { a: 1, label: 'A volte' },
    { a: 2, label: 'Spesso' },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 pt-4 pb-2">
        <button type="button" className="btn-outline !px-0 w-14 shrink-0" aria-label="Indietro" onClick={() => (i === 0 ? onExit() : setI(i - 1))}>
          <ArrowLeft size={26} strokeWidth={2.5} aria-hidden />
        </button>
        <div className="flex-1">
          <Dots total={QUESTIONS.length} current={i} />
        </div>
      </div>
      <p className="eyebrow mt-3">Situazione {i + 1} di {QUESTIONS.length} · Ti capita di…</p>
      <h1 key={q.id} className="text-h2 font-extrabold mt-2 mb-6 fade-up">{q.text}</h1>
      <div className="flex flex-col gap-3" role="radiogroup" aria-label={q.text}>
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={current === o.a}
            onClick={() => answer(o.a)}
            className="choice !min-h-[4rem] text-lead font-bold justify-center"
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => answer(null)}
        className={`mt-5 self-center min-h-touch px-4 text-body font-bold underline underline-offset-4 ${current === null ? 'text-leaf-dark' : 'text-ink-soft'}`}
      >
        Non mi riguarda
      </button>
      <div className="mt-auto pt-6 flex justify-center">
        <Listen text={`Ti capita di: ${q.text}? Mai, a volte, oppure spesso.`} />
      </div>
    </div>
  );
}
