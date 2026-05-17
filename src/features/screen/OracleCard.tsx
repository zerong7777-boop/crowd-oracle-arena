import type { Judgment, Submission } from "../../../shared/types";

export function OracleCard({
  nickname,
  submission,
  judgment
}: {
  nickname: string;
  submission: Submission;
  judgment: Judgment;
}) {
  return (
    <article className="oracle-card">
      <p className="eyebrow">{nickname}</p>
      <h2>{judgment.verdictTitle}</h2>
      <blockquote>{submission.answer}</blockquote>
      <p>{judgment.commentary}</p>
      <div className="score-row">
        <strong>{judgment.score}</strong>
        <span>{judgment.award}</span>
      </div>
    </article>
  );
}
