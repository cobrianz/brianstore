import { MongoClient } from 'mongodb';

const guides = [
  {
    title: 'A Practical Guide to Better AI Prompts',
    slug: 'practical-guide-to-better-ai-prompts',
    category: 'Free guide',
    summary: 'A clear, repeatable method for giving AI useful context, setting boundaries, and improving a first answer without needing technical jargon.',
    bodyMarkdown: `## Start with the outcome

An AI prompt is a work request, not a magic phrase. The clearest prompts explain what you are trying to accomplish, who the result is for, and what a useful result should look like. You do not need special wording. You need enough relevant information for the tool to make a sensible first attempt.

For example, “Write a post about studying” leaves the audience, purpose, and format open. “Draft a friendly 120-word post for first-year university students sharing three practical ways to plan a study session. Use plain language and finish with one question” gives the tool a much narrower target.

## The five-part prompt

Use these parts as a checklist. You can leave out any part that does not matter for your task.

1. **Task:** Say what you want done: explain, brainstorm, compare, summarize, revise, or plan.
2. **Context:** Share the relevant background, audience, and purpose. Include source material when accuracy depends on it.
3. **Constraints:** Set boundaries such as length, tone, reading level, format, or what to avoid.
4. **Output shape:** Describe how to organize the answer: a checklist, table, outline, email, or numbered steps.
5. **Quality check:** Ask the tool to identify assumptions, missing information, or claims that need verification.

## Copy-and-adapt template

“Help me [task] for [audience and purpose]. Use this context: [relevant details]. Please [constraints]. Return the result as [format]. If anything important is missing, ask me up to [number] questions first. Mark assumptions or facts I should verify.”

Replace the bracketed parts with your own details. For a simple task, one sentence may be enough. For a complicated task, provide a short brief and a sample of the style or format you want.

## Improve the answer in small steps

Treat the first response as a draft. Read it, decide what is useful, and give specific feedback. Instead of “make it better,” try “keep the first example, remove the jargon, and shorten the introduction to two sentences.” You can also ask for two alternatives and choose the direction you prefer.

If a response is too generic, add concrete details or an example. If it is too long, set a target length and ask it to preserve the important points. If it sounds unlike you, provide a short sample of your own writing and ask for an edit that keeps your voice.

## Use examples when format matters

A small example often explains a format faster than a long description. Provide a sample row, opening paragraph, or structure, then ask for new material in the same pattern. Make clear which parts are examples and which facts must remain unchanged.

## Check the result before using it

AI can produce confident mistakes, invented references, and outdated details. Verify important claims against reliable primary sources. Check names, figures, quotations, links, and dates. For work or school, follow the applicable rules and disclose AI assistance when required.

Do not paste passwords, private customer information, confidential work, or sensitive personal details into a tool unless you are authorized and understand how that service handles data. Remove identifying details when they are not needed.

## A quick prompt checklist

- Is the requested task specific?
- Does the tool know the audience and purpose?
- Have I included the information it actually needs?
- Did I set any important length, tone, or format limits?
- Will I verify facts and revise the result myself?

Clear prompts do not guarantee perfect answers, but they make useful answers easier to get, review, and improve.`,
  },
  {
    title: 'Study with AI Without Skipping the Learning',
    slug: 'study-with-ai-without-skipping-learning',
    category: 'Learning worksheet',
    summary: 'Turn AI into a patient study partner for explanations, practice questions, and revision—while keeping your own thinking at the center.',
    bodyMarkdown: `## Use AI to practice, not to replace practice

AI can explain a difficult idea in different ways, generate practice questions, and help you notice gaps in your understanding. It can also make mistakes or give you a polished answer before you have learned how to produce one. The goal is to use it as a coach: you do the thinking, and the tool helps you practice.

Start with your course materials. Notes, readings, assignment instructions, and teacher guidance should remain the authority for what you are expected to learn. When possible, give the tool a short excerpt or your own notes and ask it to stay within that material.

## A repeatable 30-minute session

1. **Choose one small goal (2 minutes).** Write down what you want to understand or remember. “Explain photosynthesis” is broad; “compare the role of light and carbon dioxide in photosynthesis” is easier to practice.
2. **Try from memory (5 minutes).** Before asking for help, write what you already know. This reveals the starting point and makes the session active.
3. **Ask for an explanation (7 minutes).** Request a plain-language explanation, a worked example, and one analogy. Ask the tool to label simplifications that might hide important details.
4. **Practice retrieval (10 minutes).** Ask for a few questions, one at a time, without showing answers first. Answer in your own words. Request hints before a full solution.
5. **Correct and summarize (4 minutes).** Compare your answers with course material. Write a three-sentence summary from memory and one question to revisit.
6. **Plan the next review (2 minutes).** Schedule a short recall check tomorrow and another later in the week.

## Useful study prompts

**Explain:** “Using only the notes below, explain [concept] in plain language. Then give one example and identify one common misunderstanding. If the notes do not contain enough information, say so.”

**Quiz:** “Quiz me on these notes one question at a time. Wait for my answer before giving feedback. Give a hint if I ask, and explain corrections using the notes.”

**Compare:** “Make a two-column comparison of [idea A] and [idea B] using only the supplied material. Include what they share, how they differ, and any uncertainty.”

**Practice:** “Create three problems that get gradually harder. Do not show the solutions until I have attempted each one. After I respond, show the reasoning, not just the answer.”

## Keep the learning honest

Use AI in ways your school or course permits. Do not submit generated work as your own or use a tool to bypass a task meant to measure your independent understanding. If you are unsure about a rule, ask your instructor. Keep track of what assistance you used when disclosure is required.

Do not assume an AI explanation is correct just because it sounds fluent. Check definitions, calculations, quotations, and references against your textbook, course notes, or a trusted source. For math and science, redo the steps yourself and test whether the method works on a new problem.

## End-of-session check

Close the chat and explain the idea aloud or on paper. Can you define it, give an example, and answer a new question without copying? If not, note exactly where you got stuck and use that as the next session's goal. The strongest study aid is still your own effortful recall, spaced practice, and feedback.`,
  },
  {
    title: 'Write with AI and Keep Your Own Voice',
    slug: 'write-with-ai-and-keep-your-voice',
    category: 'Tutorial',
    summary: 'A practical editing workflow for brainstorming, outlining, revising, and fact-checking AI-assisted writing without handing over your judgment or voice.',
    bodyMarkdown: `## Decide what help you actually need

AI is most useful when you give it a bounded writing task. You might ask for ideas, an outline, feedback on clarity, or a shorter version of a draft. You do not have to ask it to write the whole piece. Before opening a tool, write down the reader, purpose, key message, and any facts that must remain accurate.

If the writing is for school, work, a client, or publication, check the relevant policy before using AI. Requirements vary. Some settings allow brainstorming but not generated prose; others require disclosure or restrict uploading confidential material.

## A five-step writing workflow

1. **Capture your thinking.** Write rough notes in your own words: what you know, what you believe, and what you want the reader to do or understand.
2. **Ask for structure.** Share the notes and request two possible outlines. Ask the tool to preserve your main point and flag gaps instead of inventing supporting facts.
3. **Draft section by section.** Use your chosen outline. Supply the evidence and examples you trust. Ask for a first draft only where assistance is permitted.
4. **Revise for meaning.** Check that every paragraph supports the purpose. Remove repetition, vague claims, and sentences that sound polished but say little.
5. **Verify and personalize.** Check facts and links, then read the piece aloud. Restore phrases that sound like you and remove language you would not naturally use.

## Prompts for each stage

**Brainstorm:** “Give me six angles for a short [type of piece] for [audience]. Keep them distinct. Do not write the piece yet; ask about any missing audience detail that would change the ideas.”

**Outline:** “Organize these notes into a clear outline for [purpose]. Do not add new facts. Put uncertain or unsupported claims under ‘needs checking.’ Notes: [paste non-sensitive notes].”

**Clarity edit:** “Review this draft for confusing sentences, repetition, and unsupported claims. Show suggested edits next to the original and explain the reason. Keep my tone and do not add facts.”

**Shorten:** “Reduce this to about [word count] words. Preserve the central point, all names and numbers, and the call to action. List anything you removed.”

## Protect accuracy and privacy

Treat generated facts, references, statistics, quotes, and citations as unverified. Find the original source and confirm that it supports the claim in context. A plausible title or link is not proof that a source exists. If an important statement cannot be verified, remove it or clearly qualify it.

Avoid pasting personal data, private messages, unpublished client work, or confidential company information into a public AI service. Use fictional or anonymized examples when that is enough to get useful feedback.

## Final human review

Before sharing, ask: Is the main point true and clear? Does the evidence support it? Is the tone appropriate for this reader? Have I met disclosure or attribution rules? Would I be comfortable explaining and standing behind every sentence?

AI can help you move from blank page to workable draft. Your judgment, experience, and responsibility make the writing worth publishing.`,
  },
  {
    title: 'Use AI to Organize a More Focused Job Search',
    slug: 'ai-assisted-job-search-guide',
    category: 'Free guide',
    summary: 'Use AI for role research, resume tailoring, and interview practice while keeping every application accurate, personal, and genuinely yours.',
    bodyMarkdown: `## Start with a clear target

An unfocused job search makes it hard to choose roles and explain your fit. Write down the kinds of work you want, the skills you can demonstrate, the conditions you need, and any constraints such as location or schedule. Use this as a filter, not as a promise that a tool can predict your chances.

AI can help organize information and rehearse communication. It cannot verify that a job is legitimate, know your full experience, or guarantee an interview. You remain responsible for checking the employer, role, and claims in your application.

## Research a role efficiently

Copy the job description into your notes and separate it into: responsibilities, required skills, preferred skills, and practical details. Ask an AI tool to group repeated themes and identify questions you should investigate. Verify every conclusion in the original listing and on the employer's official site.

Try: “From this job description, list the five most repeated responsibilities and the skills explicitly requested. Quote the relevant phrases. Do not infer qualifications that are not stated. Suggest three questions I should answer before applying.”

Never pay an employer to apply or share banking credentials, identity documents, or sensitive data before verifying the opportunity through trusted channels.

## Tailor your resume honestly

Make a fact bank before editing: projects, responsibilities, tools, dates, outcomes, and evidence. For each bullet, describe what you did, how you did it, and the result when you can support it. If you do not have a number, do not invent one.

Ask for a comparison between your existing resume and the role requirements. Request gaps and possible edits, not fabricated experience. Keep your original facts, check every suggested phrase, and remove any claim you could not comfortably explain in an interview. Use the same truthful job history across your resume, profile, and application.

## Write a specific application message

A useful cover note connects a real requirement to a real example. Use a short structure: why this role, one or two relevant examples, and a concise close. Ask AI to spot generic language or unclear sentences, then personalize the result. Avoid claims like “perfect fit” unless you can explain what that means.

## Practice interviews

Ask the tool to act as an interviewer for the role and ask one question at a time. Answer aloud using your own experience. Request feedback on clarity and specificity, not a memorized script. For behavioral questions, practice a simple sequence: context, your responsibility, action you took, and result or lesson.

Prepare questions for the employer too: how success is measured, what the team needs, and what the next steps are. Confirm details directly with the recruiter.

## Track the process

Use a private spreadsheet with role, employer, link, date, contact, next action, and status. Set a small weekly goal you can sustain, such as researching a few roles and sending carefully tailored applications. Review which approaches get responses and adjust thoughtfully.

Keep personal data out of AI prompts unless necessary and permitted. Use placeholders instead of phone numbers, addresses, or private employer information. Your experience and judgment—not an AI-generated script—should lead the conversation.`,
  },
  {
    title: 'Plan a Week of Useful Social Content',
    slug: 'plan-a-week-of-useful-social-content',
    category: 'Learning worksheet',
    summary: 'A repeatable weekly planning system for choosing one audience need, turning it into varied posts, and learning from real audience responses.',
    bodyMarkdown: `## Begin with one audience need

Good content is easier to plan when it helps a defined group do something, understand something, or make a decision. Choose one audience for this week and write down a question they ask often. Avoid trying to serve everyone in every post.

Pick three content pillars—recurring themes you can speak about honestly. For a learning-focused creator, they might be practical tutorials, behind-the-scenes process, and answers to common questions. Use real knowledge, tested examples, and sources you can stand behind.

## Draft a simple seven-day plan

You do not need to publish every day. Use this calendar as a menu and choose a schedule you can maintain.

- **Day 1 — Teach:** Share one small, useful step that solves part of the audience's problem.
- **Day 2 — Demonstrate:** Show the step in action with a short example or screen recording.
- **Day 3 — Clarify:** Answer a common question or correct a misconception respectfully.
- **Day 4 — Invite:** Ask a focused question and make time to respond to genuine replies.
- **Day 5 — Share a process:** Explain how you approached a task, including one thing you would improve.
- **Day 6 — Curate:** Point to a trustworthy source or resource and explain why it is useful.
- **Day 7 — Review:** Note what resonated, what felt sustainable, and what to test next week.

One strong idea can become several formats. A tutorial can be a short video, a checklist, and an email. Rewrite for each platform's audience and conventions rather than copying the same post everywhere without review.

## Use AI as a planning assistant

Give the tool your audience, content pillars, preferred cadence, platform, and the expertise you can genuinely offer. Ask it for a list of ideas, then discard suggestions that are vague, repetitive, misleading, or outside your knowledge.

Prompt: “Suggest ten post ideas for [audience] who want to [goal]. Use these three content pillars: [pillars]. Each idea should teach one specific thing and fit [platform]. Do not make performance promises or invent statistics. Return a table with idea, format, and the question it answers.”

After you choose ideas, draft in your own voice. Ask AI to check readability or shorten a caption, but verify claims, links, and examples yourself. Do not use engagement bait, copied work, fake testimonials, or AI-generated claims that imply results you cannot substantiate.

## Make each post clear

A simple post often needs only three parts: a first line that tells the reader what it is about, one useful point with an example, and a relevant next step. The next step could be trying the idea, saving a checklist, or asking a question. Not every post needs a sales pitch.

## Review without chasing vanity metrics

At the end of the week, record the posts you published, the effort they took, and meaningful signals such as saves, thoughtful replies, link clicks, or sign-ups. Compare similar posts over time rather than judging a strategy from one result. Use feedback to choose the next topic.

Plan around your capacity. A small, consistent schedule with genuinely useful content is more sustainable than an ambitious calendar that burns you out.`,
  },
  {
    title: 'Turn a Useful Skill into a First Digital Download',
    slug: 'turn-a-useful-skill-into-a-digital-download',
    category: 'Tutorial',
    summary: 'A practical path from a real audience problem to a small, useful digital resource, with validation, simple pricing, and responsible promotion.',
    bodyMarkdown: `## Start with a problem you understand

A digital download is valuable when it helps a particular person complete a particular task. Begin with a problem you have observed repeatedly, not with a file format or a promise of easy income. Examples include a worksheet that organizes a process, a checklist that prevents missed steps, or a template that saves setup time.

Write a one-sentence offer: “This helps [specific person] do [specific task] without [common obstacle].” If that sentence is hard to write, talk with a few people in the intended audience. Ask what they currently do, where they get stuck, and what they have already tried. Listen before pitching.

## Validate before building too much

Look for evidence of a recurring need: repeated questions, workarounds, requests for a template, or willingness to try a small preview. A compliment is encouraging, but it is not the same as a purchase. Share a clear outline or sample and ask for specific feedback about usefulness, missing pieces, and confusion.

Keep the first version deliberately small. A focused, polished resource is easier to finish and improve than a huge bundle built on assumptions. Set a clear boundary for what it does and does not include.

## Create and test the resource

Build the content around the task. Include a short start-here section, instructions, a worked example, and a way for the user to check their result. Use readable typography, accessible contrast, descriptive file names, and a format that works on common devices.

Ask someone unfamiliar with the project to use the resource without coaching. Watch where they hesitate. Fix unclear instructions, broken links, missing steps, and printing or mobile issues. Remove personal data and check that any images, fonts, or included materials are licensed for your use.

## Choose a straightforward price

Consider the usefulness, depth, time saved, comparable alternatives, and the support you can provide. Set a price you can explain clearly. Do not claim guaranteed income, grades, health outcomes, or other results you cannot substantiate. State exactly what the buyer receives, the file format, and any requirements.

Account for payment-processing fees, taxes, refunds, and your time. Local rules differ, so consult qualified guidance for tax or legal questions. Make the checkout and refund terms easy to find.

## Publish a clear product page

Include who the resource is for, the problem it addresses, what is inside, a few preview images, how delivery works, and any limitations. Use plain language. A real sample helps the customer decide whether it fits them.

## Promote with useful content

Teach a small part of the subject publicly. Demonstrate a process, answer questions, or share a checklist. Then explain how the paid resource goes further for someone who wants a ready-to-use version. Do not spam people, buy fake engagement, or imply customer results you cannot verify. Ask subscribers for permission and provide a clear way to unsubscribe from marketing messages.

## Learn from the first customers

Track visits, checkout starts, completed purchases, support questions, refunds, and feedback. If few people visit, improve distribution. If visitors do not understand the offer, clarify the page. If customers get stuck, improve the resource. Change one thing at a time so you can learn what helped.

There is no guaranteed shortcut to sales. A useful offer, honest presentation, dependable delivery, and patient iteration give you a sounder foundation than building a large catalog before you know what people need.`,
  },
];

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Configure it in the admin app environment before seeding.');
}

for (const guide of guides) {
  if (guide.title.length > 160 || guide.summary.length > 1000 || guide.bodyMarkdown.length > 20000) {
    throw new Error(`Guide content exceeds supported field limits: ${guide.slug}`);
  }
}

const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DB || 'brian_ai_store_admin')
    .collection('guides');
  let inserted = 0;
  let repaired = 0;
  let skipped = 0;

  for (const guide of guides) {
    const now = new Date();
    const result = await collection.updateOne(
      { slug: guide.slug },
      {
        $setOnInsert: {
          ...guide,
          status: 'published',
          coverKey: '',
          publicUrl: `/guides/${guide.slug}`,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) {
      inserted += 1;
      continue;
    }

    const repair = await collection.updateOne(
      { slug: guide.slug, title: guide.title, bodyMarkdown: guide.bodyMarkdown, status: { $exists: false } },
      { $set: { status: 'published', updatedAt: new Date() } },
    );
    if (repair.modifiedCount) repaired += 1;
    else skipped += 1;
  }

  console.log(`Guide seed complete: ${inserted} inserted, ${repaired} repaired, ${skipped} already existed and were left unchanged.`);
} catch (error) {
  const errorType = error instanceof Error ? error.name : 'UnknownError';
  console.error(`Guide seeding failed (${errorType}). Database credentials and connection details were not printed.`);
  process.exitCode = 1;
} finally {
  await client.close();
}
