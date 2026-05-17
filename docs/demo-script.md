# Crowd Oracle Arena Demo Script

## 30-Second Pitch

This is Crowd Oracle Arena: a Jackbox-style AI party game. Everyone joins from their phone, answers an absurd trial, and the AI oracle judges the crowd live on the big screen.

## Live Demo

1. Host opens `/host` and creates a room.
2. Big screen opens `/screen/<roomCode>`.
3. Players join with nicknames.
4. Host starts `Save the Village`.
5. Players answer: "The Oracle has sentenced your village to be erased from history. You get one sentence to convince it to change its mind."
6. Host closes submissions and clicks `Judge Round`.
7. Host reveals verdict cards one by one.
8. Host shows the leaderboard.

## Fallback Demo

If OpenAI is slow or unavailable, remove `OPENAI_API_KEY` and run the same flow. The deterministic fallback judge will still produce scores, awards, and commentary.
