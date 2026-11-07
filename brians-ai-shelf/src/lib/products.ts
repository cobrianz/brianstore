export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  detail: string;
  includes: string[];
  image: string;
  format: string;
  price: number;
  amount: number; // cents, for Paystack
  file: string;
  downloadName: string;
}

export interface Resource {
  id: string;
  title: string;
  desc: string;
  label: string;
  img: string;
}

export const SHOP_PRODUCTS: Product[] = [
  {
    id: 'writing',
    title: 'The Everyday Writing Prompt Pack',
    category: 'AI Prompts',
    description: 'Brainstorm, outline, rewrite, and proofread with flexible prompts you can adapt to your voice.',
    detail: 'A practical set of prompt starters for everyday writing tasks. Each template includes a note on adding your topic, audience, format, and preferred tone. Review and edit every generated draft before sharing.',
    includes: ['Brainstorming and outline prompts', 'Rewrite and proofreading starters', 'Notes for tailoring each prompt'],
    image: '/assets/photo-prompts.webp',
    format: 'PROMPT PACK · DIGITAL',
    price: 5,
    amount: 500,
    file: 'everyday-writing-prompt-pack.pdf',
    downloadName: 'everyday-writing-prompt-pack.pdf',
  },
  {
    id: 'guide',
    title: 'A Starter Guide to Better AI Prompts',
    category: 'Ebooks',
    description: "A clear beginner's guide to context, constraints, examples, and better follow-up questions.",
    detail: 'Learn a repeatable way to shape a request before sending it. This short guide introduces context, audience, format, and constraints, then shows how a follow-up can improve a first response.',
    includes: ['A plain-language prompt framework', 'Vague-to-clear prompt examples', 'A checklist for refining outputs'],
    image: '/assets/photo-guide.webp',
    format: 'EBOOK · PDF',
    price: 5,
    amount: 500,
    file: 'better-ai-prompts-guide.pdf',
    downloadName: 'better-ai-prompts-guide.pdf',
  },
  {
    id: 'social',
    title: 'One-Week Social Content Planner',
    category: 'Learning',
    description: 'Plan seven posts, choose a content theme, and make space for a clear call to action.',
    detail: 'Turn a loose posting idea into a simple one-week plan. Choose a theme, map seven post ideas, and use the sample week to see how a call to action can fit.',
    includes: ['Seven-day planning worksheet', 'Theme and audience prompts', 'Sample week and CTA space'],
    image: '/assets/photo-planner.webp',
    format: 'WORKSHEET · PDF',
    price: 5,
    amount: 500,
    file: 'one-week-social-content-planner.pdf',
    downloadName: 'one-week-social-content-planner.pdf',
  },
  {
    id: 'job',
    title: 'The Job Search Assistant Prompt Kit',
    category: 'AI Prompts',
    description: 'Organize experience, shape resume drafts, practice interview questions, and prepare follow-ups.',
    detail: 'Use guided prompts to organize a job search task. Practice likely questions and refine drafts while carefully checking every name, date, skill, and claim for accuracy.',
    includes: ['Experience organization prompts', 'Interview practice starters', 'Follow-up note templates'],
    image: '/assets/photo-prompts.webp',
    format: 'PROMPT KIT · DIGITAL',
    price: 5,
    amount: 500,
    file: 'job-search-assistant-prompt-kit.pdf',
    downloadName: 'job-search-assistant-prompt-kit.pdf',
  },
  {
    id: 'budget',
    title: 'Simple Budgeting Workbook',
    category: 'Ebooks',
    description: 'A personal organizer for monthly income, recurring expenses, savings aims, and review notes.',
    detail: 'A fill-in workbook for organizing monthly money information and setting a savings intention. It is for personal planning only and is not financial advice.',
    includes: ['Income and expense pages', 'Savings intention worksheet', 'Monthly review page'],
    image: '/assets/photo-guide.webp',
    format: 'WORKBOOK · PDF',
    price: 5,
    amount: 500,
    file: 'simple-budgeting-workbook.pdf',
    downloadName: 'simple-budgeting-workbook.pdf',
  },
  {
    id: 'study',
    title: 'Your 30-Minute Study Planner',
    category: 'Learning',
    description: 'Break one learning goal into focused sessions, a practice activity, and a progress check-in.',
    detail: 'Turn a broad learning goal into manageable study sessions. Choose one practice activity, note what to revisit, and set your next small step.',
    includes: ['Goal-to-session planner', 'Practice and reflection prompts', 'Reusable progress tracker'],
    image: '/assets/photo-planner.webp',
    format: 'STUDY TOOL · PDF',
    price: 5,
    amount: 500,
    file: '30-minute-study-planner.pdf',
    downloadName: '30-minute-study-planner.pdf',
  },
];

export const FREE_RESOURCES: Resource[] = [
  { id: 'chatgpt', title: 'The Complete ChatGPT Guide', desc: 'A plain-language starting point for key ChatGPT features and what to explore first.', label: 'Free guide', img: '/assets/photo-guide.webp' },
  { id: 'claude', title: 'A Practical Guide to Claude', desc: 'Get familiar with Claude and try a few thoughtful prompts for everyday work.', label: 'Free guide', img: '/assets/photo-guide.webp' },
  { id: 'prompts', title: 'ChatGPT Prompt Starters', desc: 'Short prompt patterns for clearer requests and more useful first answers.', label: 'Prompt collection', img: '/assets/photo-prompts.webp' },
  { id: 'family-tree', title: 'Build a Family Tree with AI', desc: 'A guided research project for organizing family stories and exploring public records.', label: 'Creative project', img: '/assets/photo-planner.webp' },
  { id: 'job-search', title: 'AI Job Search Guide', desc: 'Use AI to organize your search, practice interview questions, and refine a resume draft.', label: 'Free guide', img: '/assets/photo-planner.webp' },
  { id: 'study-plan', title: 'Plan a Week of Learning', desc: 'A lightweight study planner to break a new AI topic into manageable sessions.', label: 'Learning worksheet', img: '/assets/photo-guide.webp' },
];

export const PRODUCTS_MAP: Record<string, Product> = Object.fromEntries(
  SHOP_PRODUCTS.map((p) => [p.id, p])
);
