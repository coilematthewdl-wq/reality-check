import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Check,
  X,
  Share2,
  RotateCcw,
  Info,
  ChevronRight,
  Sparkles,
  Gauge,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data — illustrative sample deck. Fictional, generic scenarios only. */
/* Production deck would be real, cited, and independently verified.   */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  "Local News",
  "Science & Health",
  "Business",
  "Entertainment",
  "Politics",
  "AI & Synthetic Media",
];

const ITEMS = [
  {
    id: "ln1",
    category: "Local News",
    content:
      "City council approves funding for three new crosswalks near the elementary school district.",
    isTrue: true,
    isAIGenerated: false,
    tip: "Procedural council items are easy to verify — check the public meeting minutes, not just a summary post.",
    source: "Sample source: city council meeting minutes archive.",
  },
  {
    id: "ln2",
    category: "Local News",
    content:
      "A local grocery chain announces it will start paying customers to shop during off-peak hours.",
    isTrue: false,
    isAIGenerated: false,
    tip: "Unusually generous 'policies' with no link to an official announcement are a common hoax shape — check the company's own newsroom page.",
    source: "Sample source: no matching press release found.",
  },
  {
    id: "ln3",
    category: "Local News",
    content:
      "A viral clip appears to show flooding overtaking a downtown intersection during last week's storm.",
    isTrue: true,
    isAIGenerated: true,
    tip: "The flooding was real, but this specific clip was synthetic. Reverse-search a still frame to find the original footage.",
    source: "Sample source: matched against verified weather-service footage.",
  },
  {
    id: "sh1",
    category: "Science & Health",
    content:
      "A regional hospital reports a new scheduling system cut average ER wait times by 12 minutes.",
    isTrue: true,
    isAIGenerated: false,
    tip: "Specific, modest numbers from a named institution are a good sign — check if the hospital published the data itself.",
    source: "Sample source: hospital system quarterly report.",
  },
  {
    id: "sh2",
    category: "Science & Health",
    content:
      "A new study claims drinking cold water before bed burns as many calories as a 20-minute walk.",
    isTrue: false,
    isAIGenerated: false,
    tip: "Big claimed results from a tiny daily habit are a classic red flag — look for the actual study, not just the headline.",
    source: "Sample source: no peer-reviewed study located.",
  },
  {
    id: "sh3",
    category: "Science & Health",
    content:
      "A clip shows a well-known doctor recommending a specific supplement brand on a morning show.",
    isTrue: false,
    isAIGenerated: true,
    tip: "Impersonation clips rarely appear anywhere else — check the person's own verified channels before trusting a single clip.",
    source: "Sample source: not found on the doctor's official accounts.",
  },
  {
    id: "bz1",
    category: "Business",
    content:
      "A mid-size furniture company shifts part of its shipping to rail instead of trucking, citing cost savings.",
    isTrue: true,
    isAIGenerated: false,
    tip: "Specific operational detail like this is easier to verify — check trade-press coverage, not just a social post.",
    source: "Sample source: trade publication coverage.",
  },
  {
    id: "bz2",
    category: "Business",
    content:
      "A popular coffee chain quietly removes all plastic straws worldwide overnight without any announcement.",
    isTrue: false,
    isAIGenerated: false,
    tip: "Global operational change 'overnight' with zero official statement almost never happens — check the company's own newsroom.",
    source: "Sample source: no newsroom entry found.",
  },
  {
    id: "bz3",
    category: "Business",
    content:
      "A leaked memo allegedly shows a tech company planning to charge for a feature that's currently free.",
    isTrue: false,
    isAIGenerated: true,
    tip: "Leaked documents that circulate without letterhead or metadata are worth extra scrutiny — check if any outlet verified the file itself.",
    source: "Sample source: no outlet verified the document.",
  },
  {
    id: "en1",
    category: "Entertainment",
    content:
      "An indie film with a tiny budget quietly becomes one of the most-streamed titles of the month.",
    isTrue: true,
    isAIGenerated: false,
    tip: "Streaming rankings are usually checkable against the platform's own published charts.",
    source: "Sample source: platform's public top-titles chart.",
  },
  {
    id: "en2",
    category: "Entertainment",
    content:
      "A popular musician announces retirement from live performing, starting next year.",
    isTrue: false,
    isAIGenerated: false,
    tip: "'Announcements' that only exist as screenshots, with no link to the artist's own accounts, are a common hoax format.",
    source: "Sample source: no matching post on verified accounts.",
  },
  {
    id: "en3",
    category: "Entertainment",
    content:
      "A clip shows a celebrity giving an unusually blunt, off-the-cuff interview answer that goes viral.",
    isTrue: false,
    isAIGenerated: true,
    tip: "Unusually 'perfect' viral soundbites are worth reverse-searching — lip-sync artifacts show up most around fast head turns.",
    source: "Sample source: no original broadcast located.",
  },
  {
    id: "pl1",
    category: "Politics",
    content:
      "A city increases its minimum notice period for utility shutoffs from 24 to 72 hours.",
    isTrue: true,
    isAIGenerated: false,
    tip: "Unglamorous procedural changes like this are usually real — and boring is itself a small tell.",
    source: "Sample source: city ordinance record.",
  },
  {
    id: "pl2",
    category: "Politics",
    content:
      "A national politician is reported to have skipped a major vote to attend a personal event.",
    isTrue: false,
    isAIGenerated: false,
    tip: "Single-sourced claims about a public figure's whereabouts are checkable against the actual public voting record.",
    source: "Sample source: voting record shows attendance.",
  },
  {
    id: "pl3",
    category: "Politics",
    content:
      "An audio clip appears to catch an elected official saying something that contradicts their public position.",
    isTrue: false,
    isAIGenerated: true,
    tip: "Audio-only clips are harder to verify by eye — check whether the same audio appears anywhere with matching video, and listen for unnatural pacing.",
    source: "Sample source: audio does not match any known recording.",
  },
  {
    id: "ai1",
    category: "AI & Synthetic Media",
    content:
      "A museum opens an exhibit using AI-generated art alongside human-made pieces, clearly labeled as such.",
    isTrue: true,
    isAIGenerated: true,
    tip: "Openly labeled synthetic content isn't the literacy problem — the problem is synthetic content presented as real.",
    source: "Sample source: museum exhibit program.",
  },
  {
    id: "ai2",
    category: "AI & Synthetic Media",
    content:
      "A post claims a popular photo app now secretly trains its AI on private camera-roll photos by default.",
    isTrue: false,
    isAIGenerated: false,
    tip: "Specific claims about default settings are checkable directly in the app's own privacy policy before resharing.",
    source: "Sample source: privacy policy contradicts the claim.",
  },
  {
    id: "ai3",
    category: "AI & Synthetic Media",
    content:
      "A brand's new ad is fully AI-generated and disclosed as such in the video description.",
    isTrue: true,
    isAIGenerated: true,
    tip: "Disclosure is the whole ballgame here — the same clip without a disclosure line would be a very different situation.",
    source: "Sample source: disclosure present in video description.",
  },
];

const ROUND_OPTIONS = [6, 10, 14];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePeers(centerBool) {
  const center = centerBool ? 68 : 32;
  return Array.from({ length: 5 }, () =>
    clamp(Math.round(center + (Math.random() * 50 - 25)), 0, 100)
  );
}

function buildPeerData(deckItems) {
  return deckItems.map((item) => ({
    truthPeers: generatePeers(item.isTrue),
    originPeers: generatePeers(item.isAIGenerated),
  }));
}

function brier(confidence0to100, outcomeBool) {
  const o = outcomeBool ? 1 : 0;
  const c = confidence0to100 / 100;
  return (c - o) * (c - o);
}

function computeRoundPoints(answer, item) {
  const truthB = brier(answer.truth, item.isTrue);
  const originB = brier(answer.origin, item.isAIGenerated);
  const truthPts = Math.round((1 - truthB) * 100);
  const originPts = Math.round((1 - originB) * 100);
  const combined = Math.round((truthPts + originPts) / 2);
  return { truthPts, originPts, combined };
}

function tierText(score) {
  if (score >= 80) return "Sharp calibration — your gut and your accuracy are talking to each other.";
  if (score >= 60) return "Decent instincts, with some overconfidence creeping in.";
  if (score >= 40) return "Your gut and your accuracy aren't fully in sync yet.";
  return "Time to slow down before hitting share.";
}

function calibrationBuckets(deck, answers, axis) {
  const bins = [
    { label: "0–33%", min: 0, max: 33 },
    { label: "34–66%", min: 34, max: 66 },
    { label: "67–100%", min: 67, max: 100 },
  ];
  return bins
    .map((bin) => {
      const rows = deck
        .map((item, i) => ({ item, answer: answers[i] }))
        .filter(({ answer }) => {
          if (!answer) return false;
          const v = axis === "truth" ? answer.truth : answer.origin;
          return v >= bin.min && v <= bin.max;
        });
      if (rows.length === 0) {
        return { bucket: bin.label, "Stated confidence": null, "Actually true": null, count: 0 };
      }
      const avgConfidence = Math.round(
        rows.reduce((s, r) => s + (axis === "truth" ? r.answer.truth : r.answer.origin), 0) /
          rows.length
      );
      const positiveCount = rows.filter((r) =>
        axis === "truth" ? r.item.isTrue : r.item.isAIGenerated
      ).length;
      const actualRate = Math.round((positiveCount / rows.length) * 100);
      return {
        bucket: bin.label,
        "Stated confidence": avgConfidence,
        "Actually true": actualRate,
        count: rows.length,
      };
    })
    .filter((b) => b.count > 0);
}

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

function DialSlider({ label, value, onChange, leftLabel, rightLabel }) {
  return (
    <div className="gc-dial">
      <div className="gc-dial-title">{label}</div>
      <div className="gc-dial-labels">
        <span>{leftLabel}</span>
        <span className="gc-dial-readout gc-mono">{value}%</span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="gc-range"
        aria-label={label}
        aria-valuetext={`${value}%`}
      />
    </div>
  );
}

function GapBar({ label, value, actual }) {
  const actualPos = actual ? 100 : 0;
  const start = Math.min(value, actualPos);
  const rawWidth = Math.abs(value - actualPos);
  
  // Safe bounded fill width to prevent overflowing track width
  const safeWidth = Math.min(Math.max(rawWidth, 1), 100 - start);
  const error = Math.abs(value - actualPos);
  const gapColor =
    error <= 20 ? "var(--gc-teal)" : error <= 50 ? "var(--gc-brass)" : "var(--gc-rust)";

  return (
    <div className="gc-gapbar">
      <div className="gc-gapbar-label">{label}</div>
      <div className="gc-gapbar-track">
        <div
          className="gc-gapbar-fill"
          style={{
            left: `${start}%`,
            width: `${safeWidth}%`,
            background: gapColor,
          }}
        />
        <div className="gc-gapbar-mark gc-gapbar-you" style={{ left: `${value}%` }}>
          <span>You: {value}%</span>
        </div>
        <div className="gc-gapbar-mark gc-gapbar-actual" style={{ left: `${actualPos}%` }}>
          <span>Actual</span>
        </div>
      </div>
    </div>
  );
}

function PeerDots({ peers, you, showYou }) {
  return (
    <div className="gc-peer-track">
      {peers.map((p, i) => (
        <div key={i} className="gc-peer-dot" style={{ left: `${p}%` }} title={`Peer: ${p}%`} />
      ))}
      {showYou && (
        <div className="gc-peer-dot gc-peer-you" style={{ left: `${you}%` }}>
          <span>YOU</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="gc-panel gc-statcard">
      <div className="gc-statcard-value gc-mono">{value}</div>
      <div className="gc-statcard-label">{label}</div>
      {sub && <div className="gc-statcard-sub">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens                                                              */
/* ------------------------------------------------------------------ */

function HomeScreen({
  selectedCategories,
  toggleCategory,
  roundCount,
  setRoundCount,
  onStart,
  availableCount,
}) {
  const canStart = selectedCategories.length > 0 && availableCount > 0;
  return (
    <div className="gc-fade-in">
      <div className="gc-brand">
        <Gauge size={22} />
        <span className="gc-display gc-brand-title">GUT CHECK</span>
      </div>
      <p className="gc-lede">
        A calibration game for people who share fast. You won't just be scored on right or
        wrong — you'll be scored on whether your confidence matched reality.
      </p>

      <div className="gc-panel gc-section">
        <div className="gc-section-title">Choose categories</div>
        <div className="gc-chip-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`gc-chip ${selectedCategories.includes(c) ? "active" : ""}`}
              onClick={() => toggleCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="gc-panel gc-section">
        <div className="gc-section-title">Session length</div>
        <div className="gc-chip-row">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              className={`gc-chip ${roundCount === n ? "active" : ""}`}
              onClick={() => setRoundCount(n)}
            >
              {n} rounds
            </button>
          ))}
        </div>
        {!canStart ? (
          <div className="gc-warn">
            {selectedCategories.length === 0
              ? "Select at least one category to continue."
              : "No items available for this selection."}
          </div>
        ) : availableCount < roundCount ? (
          <div className="gc-warn" style={{ color: "var(--gc-brass)" }}>
            Note: Only {availableCount} items available matching selected categories.
          </div>
        ) : null}
      </div>

      <button className="gc-btn gc-btn-primary gc-start-btn" disabled={!canStart} onClick={onStart}>
        Start session <ChevronRight size={16} />
      </button>

      <details className="gc-details">
        <summary>What's real vs. simulated in this prototype</summary>
        <ul>
          <li>The deck below is illustrative sample content for testing the mechanic — not a verified, cited production deck.</li>
          <li>The "group" distribution on the reveal screen is simulated for a single player, to demo the anonymized-reveal design.</li>
          <li>A production build would need: a real curated and cited content pipeline, live multiplayer sync, and a moderation flow for user-submitted clips.</li>
        </ul>
      </details>
    </div>
  );
}

function RoundScreen({
  item,
  index,
  total,
  currentAnswer,
  setCurrentAnswer,
  onSubmit,
  avgSoFar,
}) {
  if (!item) return null;

  return (
    <div className="gc-fade-in">
      <div className="gc-topbar">
        <span className="gc-mono gc-eyebrow">
          ROUND {index + 1} / {total}
        </span>
        {avgSoFar !== null && (
          <span className="gc-mono gc-eyebrow gc-topbar-score">Avg so far: {avgSoFar}</span>
        )}
      </div>

      <div className="gc-tag gc-cat-tag">{item.category}</div>

      <div className="gc-panel gc-content-card">
        <p>{item.content}</p>
      </div>

      <DialSlider
        label="How true is this?"
        value={currentAnswer.truth}
        onChange={(v) => setCurrentAnswer({ ...currentAnswer, truth: v })}
        leftLabel="DEFINITELY FALSE"
        rightLabel="DEFINITELY TRUE"
      />

      <DialSlider
        label="Is this AI-generated?"
        value={currentAnswer.origin}
        onChange={(v) => setCurrentAnswer({ ...currentAnswer, origin: v })}
        leftLabel="LOOKS AUTHENTIC"
        rightLabel="LOOKS AI-GENERATED"
      />

      <div className="gc-share-block">
        <div className="gc-dial-title">Would you share this?</div>
        <div className="gc-share-row">
          <button
            className={`gc-btn gc-btn-ghost ${currentAnswer.share === true ? "gc-share-active-yes" : ""}`}
            onClick={() => setCurrentAnswer({ ...currentAnswer, share: true })}
          >
            <Share2 size={14} /> Yes, I'd share it
          </button>
          <button
            className={`gc-btn gc-btn-ghost ${currentAnswer.share === false ? "gc-share-active-no" : ""}`}
            onClick={() => setCurrentAnswer({ ...currentAnswer, share: false })}
          >
            <X size={14} /> No, I wouldn't
          </button>
        </div>
      </div>

      <button
        className="gc-btn gc-btn-primary gc-start-btn"
        disabled={currentAnswer.share === null}
        onClick={onSubmit}
      >
        Lock in answer <ChevronRight size={16} />
      </button>
    </div>
  );
}

function RevealScreen({ item, answer, peers, isLast, onContinue, showMyMark, setShowMyMark }) {
  if (!item || !answer) return null;

  const shareNote = (() => {
    if (answer.share !== true) return null;
    const uncertain = answer.truth >= 35 && answer.truth <= 65;
    const confidentlyWrong =
      (answer.truth >= 70 && !item.isTrue) || (answer.truth <= 30 && item.isTrue);
    if (confidentlyWrong) {
      return "You were confident about this one, and wrong — and you'd still have shared it.";
    }
    if (uncertain) {
      return `You said you'd share this while only ${answer.truth}% sure. That's a reflex share.`;
    }
    return null;
  })();

  return (
    <div className="gc-fade-in">
      <div className="gc-reveal-tags">
        <span className={`gc-tag ${item.isTrue ? "gc-tag-true" : "gc-tag-false"}`}>
          {item.isTrue ? <Check size={14} /> : <X size={14} />} {item.isTrue ? "True" : "False"}
        </span>
        <span className={`gc-tag ${item.isAIGenerated ? "gc-tag-false" : "gc-tag-true"}`}>
          <Sparkles size={14} /> {item.isAIGenerated ? "AI-generated" : "Authentic"}
        </span>
      </div>

      <div className="gc-panel gc-content-card gc-content-card-small">
        <p>{item.content}</p>
      </div>

      <div className="gc-panel gc-section">
        <div className="gc-points-row">
          <div>
            <div className="gc-points-label">Truth calibration</div>
            <div className="gc-mono gc-points-value">+{answer.points?.truthPts ?? 0}</div>
          </div>
          <div>
            <div className="gc-points-label">Origin calibration</div>
            <div className="gc-mono gc-points-value">+{answer.points?.originPts ?? 0}</div>
          </div>
          <div>
            <div className="gc-points-label">Round total</div>
            <div className="gc-mono gc-points-value gc-points-value-total">
              +{answer.points?.combined ?? 0}
            </div>
          </div>
        </div>

        <GapBar label="Truth" value={answer.truth} actual={item.isTrue} />
        <GapBar label="Origin" value={answer.origin} actual={item.isAIGenerated} />
      </div>

      {peers && (
        <div className="gc-panel gc-section">
          <div className="gc-section-title-row">
            <span className="gc-section-title">Group distribution (simulated)</span>
            <button className="gc-link-btn" onClick={() => setShowMyMark(!showMyMark)}>
              {showMyMark ? "Hide my mark" : "Show my mark"}
            </button>
          </div>
          <PeerDots peers={peers.truthPeers} you={answer.truth} showYou={showMyMark} />
        </div>
      )}

      <div className="gc-panel gc-tip-card">
        <Info size={16} />
        <div>
          <div className="gc-tip-text">{item.tip}</div>
          <div className="gc-tip-source">{item.source}</div>
        </div>
      </div>

      {shareNote && <div className="gc-share-note">{shareNote}</div>}

      <button className="gc-btn gc-btn-primary gc-start-btn" onClick={onContinue}>
        {isLast ? "See results" : "Next round"} <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SummaryScreen({ deck, answers, onRestart }) {
  const [axis, setAxis] = useState("truth");

  // Filter completed answers safely
  const validAnswers = useMemo(() => answers.filter(Boolean), [answers]);
  const totalRounds = validAnswers.length || 1; // Prevent division by zero

  const overallScore = Math.round(
    validAnswers.reduce((s, a) => s + (a.points?.combined ?? 0), 0) / totalRounds
  );
  const truthAvg = Math.round(
    validAnswers.reduce((s, a) => s + (a.points?.truthPts ?? 0), 0) / totalRounds
  );
  const originAvg = Math.round(
    validAnswers.reduce((s, a) => s + (a.points?.originPts ?? 0), 0) / totalRounds
  );

  const shareRows = deck
    .map((item, i) => ({ item, answer: answers[i] }))
    .filter((r) => r.answer?.share === true);

  const totalShares = shareRows.length;
  const uncertainShares = shareRows.filter(
    (r) => r.answer.truth >= 35 && r.answer.truth <= 65
  ).length;
  const confidentWrongShares = shareRows.filter(
    (r) =>
      (r.answer.truth >= 70 && !r.item.isTrue) || (r.answer.truth <= 30 && r.item.isTrue)
  ).length;

  const chartData = useMemo(() => calibrationBuckets(deck, answers, axis), [deck, answers, axis]);

  return (
    <div className="gc-fade-in">
      <div className="gc-eyebrow gc-mono">SESSION COMPLETE</div>

      <div className="gc-panel gc-score-panel">
        <div className="gc-mono gc-score-big">{overallScore}</div>
        <div className="gc-score-caption">Calibration score</div>
        <p className="gc-score-tier">{tierText(overallScore)}</p>
      </div>

      <div className="gc-stat-grid">
        <StatCard label="Truth-axis avg" value={truthAvg} />
        <StatCard label="Origin-axis avg" value={originAvg} />
        <StatCard label="Rounds played" value={deck.length} />
      </div>

      <div className="gc-panel gc-section">
        <div className="gc-section-title">Sharing reflex</div>
        <p className="gc-muted-text">
          You said you'd share {totalShares} of {deck.length} items.
        </p>
        <ul className="gc-reflex-list">
          <li>
            <strong>{uncertainShares}</strong> were shared while sitting near 50/50 — a reflex
            share, not a confident one.
          </li>
          <li>
            <strong>{confidentWrongShares}</strong> were shared while confidently wrong about the
            content.
          </li>
        </ul>
      </div>

      <div className="gc-panel gc-section">
        <div className="gc-section-title-row">
          <span className="gc-section-title">Calibration chart</span>
          <div className="gc-chip-row gc-chip-row-tight">
            <button
              className={`gc-chip ${axis === "truth" ? "active" : ""}`}
              onClick={() => setAxis("truth")}
            >
              Truth axis
            </button>
            <button
              className={`gc-chip ${axis === "origin" ? "active" : ""}`}
              onClick={() => setAxis("origin")}
            >
              Origin axis
            </button>
          </div>
        </div>
        <p className="gc-muted-text gc-chart-caption">
          Bars close together mean your stated confidence matched how often you were actually
          right in that range.
        </p>
        {chartData.length === 0 ? (
          <p className="gc-muted-text">Not enough data yet — play a few more rounds.</p>
        ) : (
          <div className="gc-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(242,239,233,0.08)" />
                <XAxis dataKey="bucket" stroke="#8B96A3" fontSize={11} />
                <YAxis stroke="#8B96A3" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#1B2127",
                    border: "1px solid rgba(242,239,233,0.15)",
                    borderRadius: 8,
                    color: "#F2EFE9",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#8B96A3" }} />
                <Bar dataKey="Stated confidence" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actually true" fill="#3FA796" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="gc-panel gc-section">
        <div className="gc-section-title">Round history</div>
        <div className="gc-table-wrap">
          <table className="gc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Truth</th>
                <th>Origin</th>
                <th>Answer</th>
                <th>Points</th>
                <th>Shared?</th>
              </tr>
            </thead>
            <tbody>
              {deck.map((item, i) => {
                const a = answers[i];
                if (!a) return null;
                return (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>{item.category}</td>
                    <td>{a.truth}%</td>
                    <td>{a.origin}%</td>
                    <td>
                      {item.isTrue ? "True" : "False"} /{" "}
                      {item.isAIGenerated ? "AI" : "Authentic"}
                    </td>
                    <td>{a.points?.combined ?? 0}</td>
                    <td>{a.share ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="gc-btn gc-btn-primary gc-start-btn" onClick={onRestart}>
        <RotateCcw size={16} /> Start a new session
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root app                                                             */
/* ------------------------------------------------------------------ */

export default function GutCheckApp() {
  const [screen, setScreen] = useState("home");
  const [selectedCategories, setSelectedCategories] = useState([...CATEGORIES]);
  const [roundCount, setRoundCount] = useState(10);

  const [deck, setDeck] = useState([]);
  const [peerData, setPeerData] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState({ truth: 50, origin: 50, share: null });
  const [showMyMark, setShowMyMark] = useState(false);

  const availableCount = useMemo(
    () => ITEMS.filter((it) => selectedCategories.includes(it.category)).length,
    [selectedCategories]
  );

  function toggleCategory(c) {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleStart() {
    const available = ITEMS.filter((it) => selectedCategories.includes(it.category));
    const size = Math.min(roundCount, available.length);
    const chosen = shuffle(available).slice(0, size);
    setDeck(chosen);
    setPeerData(buildPeerData(chosen));
    setAnswers(Array(chosen.length).fill(null));
    setCurrentIndex(0);
    setCurrentAnswer({ truth: 50, origin: 50, share: null });
    setShowMyMark(false);
    setScreen("round");
  }

  function handleSubmitRound() {
    if (currentAnswer.share === null) return;
    const item = deck[currentIndex];
    const points = computeRoundPoints(currentAnswer, item);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { ...currentAnswer, points };
    setAnswers(newAnswers);
    setShowMyMark(false);
    setScreen("reveal");
  }

  function handleContinue() {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer({ truth: 50, origin: 50, share: null });
      setShowMyMark(false);
      setScreen("round");
    } else {
      setScreen("summary");
    }
  }

  function handleRestart() {
    setScreen("home");
    setDeck([]);
    setPeerData([]);
    setAnswers([]);
    setCurrentIndex(0);
  }

  const answeredSoFar = answers.filter(Boolean);
  const avgSoFar =
    screen === "round" && answeredSoFar.length > 0
      ? Math.round(answeredSoFar.reduce((s, a) => s + (a.points?.combined ?? 0), 0) / answeredSoFar.length)
      : null;

  return (
    <div className="gc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');

        .gc-root {
          --gc-ink: #14181C;
          --gc-panel: #1B2127;
          --gc-panel-2: #222933;
          --gc-brass: #D4AF37;
          --gc-teal: #3FA796;
          --gc-rust: #E2725B;
          --gc-fog: #F2EFE9;
          --gc-muted: #8B96A3;
          background: var(--gc-ink);
          color: var(--gc-fog);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 24px 16px 48px;
          border-radius: 16px;
          max-width: 640px;
          margin: 0 auto;
        }
        .gc-root *, .gc-root *::before, .gc-root *::after { box-sizing: border-box; }
        .gc-root *:focus-visible { outline: 2px solid var(--gc-brass); outline-offset: 2px; border-radius: 4px; }

        .gc-display { font-family: 'Space Grotesk', 'Arial Narrow', sans-serif; }
        .gc-mono { font-family: 'IBM Plex Mono', ui-monospace, 'Courier New', monospace; }

        .gc-brand { display: flex; align-items: center; gap: 8px; color: var(--gc-brass); }
        .gc-brand-title { font-size: 26px; font-weight: 700; letter-spacing: 0.04em; }
        .gc-lede { color: var(--gc-muted); font-size: 14px; line-height: 1.55; margin: 10px 0 20px; max-width: 52ch; }

        .gc-panel { background: var(--gc-panel); border: 1px solid rgba(242,239,233,0.08); border-radius: 12px; }
        .gc-section { padding: 16px; margin-bottom: 14px; }
        .gc-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gc-muted); margin-bottom: 10px; }
        .gc-section-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .gc-section-title-row .gc-section-title { margin-bottom: 0; }

        .gc-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .gc-chip-row-tight { gap: 6px; }
        .gc-chip {
          padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(242,239,233,0.18);
          font-size: 12.5px; cursor: pointer; color: var(--gc-muted); background: transparent;
          transition: all 0.15s ease; font-family: 'Inter', sans-serif;
        }
        .gc-chip:hover { border-color: rgba(242,239,233,0.4); color: var(--gc-fog); }
        .gc-chip.active { border-color: var(--gc-brass); color: var(--gc-brass); background: rgba(212,175,55,0.08); }

        .gc-warn { margin-top: 10px; font-size: 12.5px; color: var(--gc-rust); }

        .gc-btn {
          padding: 12px 22px; border-radius: 8px; font-weight: 600; font-size: 14px;
          cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px;
          transition: opacity 0.15s ease; font-family: 'Inter', sans-serif;
        }
        .gc-btn-primary { background: var(--gc-brass); color: var(--gc-ink); }
        .gc-btn-primary[disabled] { opacity: 0.35; cursor: not-allowed; }
        .gc-btn-primary:hover:not([disabled]) { opacity: 0.88; }
        .gc-btn-ghost { background: transparent; color: var(--gc-fog); border: 1px solid rgba(242,239,233,0.22); }
        .gc-btn-ghost:hover { border-color: rgba(242,239,233,0.5); }
        .gc-start-btn { width: 100%; justify-content: center; margin-top: 6px; }

        .gc-link-btn { background: none; border: none; color: var(--gc-brass); font-size: 12px; cursor: pointer; padding: 0; }
        .gc-link-btn:hover { text-decoration: underline; }

        .gc-details { margin-top: 22px; font-size: 12.5px; color: var(--gc-muted); }
        .gc-details summary { cursor: pointer; color: var(--gc-fog); }
        .gc-details ul { margin: 10px 0 0; padding-left: 18px; line-height: 1.6; }

        .gc-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .gc-eyebrow { font-size: 11px; letter-spacing: 0.08em; color: var(--gc-muted); }
        .gc-topbar-score { color: var(--gc-brass); }

        .gc-tag {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px;
          font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .gc-cat-tag { background: rgba(242,239,233,0.06); color: var(--gc-muted); margin-bottom: 12px; }
        .gc-tag-true { background: rgba(63,167,150,0.15); color: var(--gc-teal); border: 1px solid rgba(63,167,150,0.4); }
        .gc-tag-false { background: rgba(226,114,91,0.15); color: var(--gc-rust); border: 1px solid rgba(226,114,91,0.4); }
        .gc-reveal-tags { display: flex; gap: 8px; margin-bottom: 12px; }

        .gc-content-card { padding: 22px; margin-bottom: 18px; }
        .gc-content-card p { font-size: 17px; line-height: 1.5; margin: 0; }
        .gc-content-card-small { padding: 16px; margin-bottom: 14px; }
        .gc-content-card-small p { font-size: 14px; color: var(--gc-muted); }

        .gc-dial { margin-bottom: 20px; }
        .gc-dial-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
        .gc-dial-labels { display: flex; justify-content: space-between; align-items: center; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--gc-muted); margin-bottom: 6px; }
        .gc-dial-readout { color: var(--gc-fog); font-size: 12.5px; background: var(--gc-panel-2); padding: 2px 9px; border-radius: 999px; }

        input.gc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 999px;
          background: linear-gradient(90deg, var(--gc-rust) 0%, #4A5460 50%, var(--gc-teal) 100%); outline: none; cursor: pointer; }
        input.gc-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: var(--gc-fog); border: 3px solid var(--gc-brass); cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        input.gc-range::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--gc-fog);
          border: 3px solid var(--gc-brass); cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        input.gc-range::-moz-range-track { height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--gc-rust) 0%, #4A5460 50%, var(--gc-teal) 100%); }

        .gc-share-block { margin: 20px 0; }
        .gc-share-row { display: flex; gap: 10px; margin-top: 8px; }
        .gc-share-active-yes { border-color: var(--gc-teal); color: var(--gc-teal); }
        .gc-share-active-no { border-color: var(--gc-rust); color: var(--gc-rust); }

        .gc-points-row { display: flex; justify-content: space-between; margin-bottom: 18px; }
        .gc-points-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gc-muted); margin-bottom: 4px; }
        .gc-points-value { font-size: 20px; color: var(--gc-fog); }
        .gc-points-value-total { color: var(--gc-brass); }

        .gc-gapbar { margin-bottom: 26px; }
        .gc-gapbar:last-child { margin-bottom: 4px; }
        .gc-gapbar-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-muted); }
        .gc-gapbar-track { position: relative; height: 8px; background: var(--gc-panel-2); border-radius: 999px; margin-top: 22px; }
        .gc-gapbar-fill { position: absolute; top: 50%; height: 4px; transform: translateY(-50%); border-radius: 2px; opacity: 0.6; }
        .gc-gapbar-mark { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; }
        .gc-gapbar-you { background: var(--gc-fog); border: 2px solid var(--gc-brass); z-index: 2; }
        .gc-gapbar-actual { background: transparent; border: 2px solid var(--gc-teal); }
        .gc-gapbar-mark span { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 9.5px; white-space: nowrap; color: var(--gc-muted); }

        .gc-peer-track { position: relative; height: 30px; background: var(--gc-panel-2); border-radius: 999px; margin-top: 4px; }
        .gc-peer-dot { position: absolute; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: var(--gc-muted); transform: translate(-50%, -50%); opacity: 0.7; }
        .gc-peer-you { background: var(--gc-brass); width: 13px; height: 13px; opacity: 1; z-index: 2; }
        .gc-peer-you span { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 9px; color: var(--gc-brass); }

        .gc-tip-card { display: flex; gap: 10px; padding: 14px 16px; margin-bottom: 14px; color: var(--gc-muted); }
        .gc-tip-card svg { flex-shrink: 0; margin-top: 2px; color: var(--gc-brass); }
        .gc-tip-text { color: var(--gc-fog); font-size: 13.5px; line-height: 1.5; }
        .gc-tip-source { font-size: 11.5px; font-style: italic; margin-top: 6px; color: var(--gc-muted); }

        .gc-share-note { font-size: 13px; color: var(--gc-rust); background: rgba(226,114,91,0.08); border: 1px solid rgba(226,114,91,0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }

        .gc-score-panel { text-align: center; padding: 28px 16px; margin-bottom: 16px; }
        .gc-score-big { font-size: 52px; color: var(--gc-brass); line-height: 1; }
        .gc-score-caption { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gc-muted); margin-top: 6px; }
        .gc-score-tier { font-size: 13.5px; color: var(--gc-fog); margin: 12px 0 0; max-width: 40ch; margin-left: auto; margin-right: auto; }

        .gc-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .gc-statcard { padding: 14px 10px; text-align: center; }
        .gc-statcard-value { font-size: 22px; color: var(--gc-fog); }
        .gc-statcard-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gc-muted); margin-top: 4px; }

        .gc-muted-text { font-size: 13px; color: var(--gc-muted); line-height: 1.5; }
        .gc-chart-caption { margin: 2px 0 12px; }
        .gc-reflex-list { margin: 8px 0 0; padding-left: 18px; font-size: 13px; line-height: 1.7; color: var(--gc-fog); }

        .gc-chart-wrap { margin-top: 6px; width: 100%; height: 240px; }

        .gc-table-wrap { max-height: 260px; overflow-y: auto; margin-top: 4px; }
        .gc-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .gc-table th { text-align: left; padding: 8px 6px; color: var(--gc-muted); text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.05em; border-bottom: 1px solid rgba(242,239,233,0.12); position: sticky; top: 0; background: var(--gc-panel); }
        .gc-table td { padding: 8px 6px; border-bottom: 1px solid rgba(242,239,233,0.06); color: var(--gc-fog); }

        .gc-fade-in { opacity: 1; }
        @media (prefers-reduced-motion: no-preference) {
          .gc-fade-in { animation: gcFadeUp 0.35s ease both; }
        }
        @keyframes gcFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {screen === "home" && (
        <HomeScreen
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          roundCount={roundCount}
          setRoundCount={setRoundCount}
          onStart={handleStart}
          availableCount={availableCount}
        />
      )}

      {screen === "round" && (
        <RoundScreen
          item={deck[currentIndex]}
          index={currentIndex}
          total={deck.length}
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          onSubmit={handleSubmitRound}
          avgSoFar={avgSoFar}
        />
      )}

      {screen === "reveal" && (
        <RevealScreen
          item={deck[currentIndex]}
          answer={answers[currentIndex]}
          peers={peerData[currentIndex]}
          isLast={currentIndex + 1 >= deck.length}
          onContinue={handleContinue}
          showMyMark={showMyMark}
          setShowMyMark={setShowMyMark}
        />
      )}

      {screen === "summary" && <SummaryScreen deck={deck} answers={answers} onRestart={handleRestart} />}
    </div>
  );
}