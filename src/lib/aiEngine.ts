import type { KnowledgeArticle } from './supabase';

export type AIResponse = {
  content: string;
  suggestedCategory: string | null;
  canEscalate: boolean;
  matchedArticle: KnowledgeArticle | null;
  confidence: number;
};

const GREETING_PATTERNS = [
  /^(hi|hello|hey|greetings|good (morning|afternoon|evening))\b/i,
];

const THANKS_PATTERNS = [
  /^(thanks|thank you|thx|appreciate it|great|awesome|perfect|that worked|solved)\b/i,
];

const GREETING_RESPONSE = `Hello! I'm your AI IT support assistant. I can help you troubleshoot common IT issues like:

- Wi-Fi and network connectivity
- Printer problems
- Software installation errors
- Email and account login
- Password resets
- Hardware issues
- Security concerns

What seems to be the problem today? Describe the issue in as much detail as you can.`;

const THANKS_RESPONSE = `You're welcome! I'm glad I could help. If you run into any other IT issues, just start a new chat or come back anytime. Have a great day!`;

const NO_MATCH_RESPONSE = `I'm not sure I've found an exact match for that issue. Could you give me a bit more detail? For example:

- What device or application is affected?
- What error message (if any) are you seeing?
- When did the problem start?
- Have you made any recent changes?

If you'd prefer, I can escalate this to a human support technician who can investigate further.`;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function scoreArticle(query: string, article: KnowledgeArticle): number {
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(query);

  let score = 0;

  for (const keyword of article.keywords) {
    const kw = keyword.toLowerCase();
    if (queryLower.includes(kw)) {
      score += 3;
    }
    if (queryTokens.includes(kw)) {
      score += 2;
    }
  }

  const titleTokens = tokenize(article.title);
  const problemTokens = tokenize(article.problem);

  for (const token of queryTokens) {
    if (titleTokens.includes(token)) score += 2;
    if (problemTokens.includes(token)) score += 1;
  }

  if (queryLower.includes(article.title.toLowerCase())) {
    score += 5;
  }

  return score;
}

export function generateAIResponse(
  userMessage: string,
  knowledgeBase: KnowledgeArticle[],
  messageCount: number
): AIResponse {
  const trimmed = userMessage.trim();

  if (GREETING_PATTERNS.some((p) => p.test(trimmed)) && messageCount <= 1) {
    return {
      content: GREETING_RESPONSE,
      suggestedCategory: null,
      canEscalate: false,
      matchedArticle: null,
      confidence: 1,
    };
  }

  if (THANKS_PATTERNS.some((p) => p.test(trimmed))) {
    return {
      content: THANKS_RESPONSE,
      suggestedCategory: null,
      canEscalate: false,
      matchedArticle: null,
      confidence: 1,
    };
  }

  const scored = knowledgeBase
    .map((article) => ({ article, score: scoreArticle(trimmed, article) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0 || scored[0].score < 2) {
    return {
      content: NO_MATCH_RESPONSE,
      suggestedCategory: null,
      canEscalate: true,
      matchedArticle: null,
      confidence: 0.2,
    };
  }

  const best = scored[0];
  const confidence = Math.min(best.score / 10, 1);
  const article = best.article;

  const escalationPrompt = confidence < 0.5 || messageCount >= 4
    ? '\n\nIf this doesn\'t resolve the issue, I can escalate this to a human support technician — just click "Escalate to Ticket" below.'
    : '';

  const content = `**${article.title}**

${article.solution}${escalationPrompt}`;

  return {
    content,
    suggestedCategory: article.categories?.name ?? null,
    canEscalate: true,
    matchedArticle: article,
    confidence,
  };
}

export const QUICK_PROMPTS = [
  { label: 'Wi-Fi not connecting', message: 'I cannot connect to the office Wi-Fi network.' },
  { label: 'Printer offline', message: 'My printer is showing as offline and not printing.' },
  { label: 'Forgot password', message: 'I forgot my password and cannot sign in.' },
  { label: 'Email not syncing', message: 'My email is not syncing — I am not receiving new emails.' },
  { label: 'Software install error', message: 'I am getting an error when trying to install software.' },
  { label: 'Computer running slow', message: 'My computer is running very slowly.' },
  { label: 'VPN not connecting', message: 'My VPN will not connect to the corporate network.' },
  { label: 'Suspect malware', message: 'I think my computer may have a virus or malware.' },
];
