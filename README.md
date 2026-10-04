<div style="text-align: center;">
  <img src="public/icon.svg" alt="Logo" height="40" />
  <h1>Reviewr</h1>
</div>

An AI-powered reviewer platform where users create their own knowledge-based reviewers by uploading documents and chatting with them. Designed for educators, students, reviewers, trainers, and professionals who want AI assistants grounded in their own learning materials.

## Overview

Instead of training custom AI models, Reviewr uses Retrieval-Augmented Generation (RAG) to provide answers, quizzes, summaries, and study materials based on uploaded documents.

## Document-Based Knowledge

Documents are processed and indexed into a vector database, allowing the AI to answer questions based on uploaded content.

> Currently supported file formats: PDF, DOCX, PPTX, TXT

## AI Chat Assistant

Interact naturally with your reviewer.

Examples:

- `Generate 20 multiple-choice questions about Educational Psychology.`
- `Explain the concept of Constructivism.`
- `Create a mock LET examination.`
- `Summarize Chapter 3.`
- `Generate 20 flashcards from the history of Y2K bug.`

## Source-Aware Responses

Responses can include references to source materials.

Example:

```
Source: [ Educational_Psychology.pdf - Page 42 ]
```

This improves transparency and trustworthiness.

## Study Modes

Choose the mode that fits how you want to study.

<table>
  <thead>
    <tr>
      <th align="left">Mode</th>
      <th align="left">Purpose</th>
      <th align="left">Best For</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tutor Mode</strong></td>
      <td>Provides step-by-step explanations and answers questions on any topic</td>
      <td>Learning new concepts or clearing up confusion</td>
    </tr>
    <tr>
      <td><strong>Quiz Mode</strong></td>
      <td>Generates practice exams with answer keys and explanations</td>
      <td>Testing knowledge and preparing for assessments</td>
    </tr>
    <tr>
      <td><strong>Flashcard Mode</strong></td>
      <td>Creates flashcards from your notes or lesson material</td>
      <td>Memorizing terms, definitions, and key facts</td>
    </tr>
    <tr>
      <td><strong>Summary Mode</strong></td>
      <td>Condenses lessons and chapters into concise overviews</td>
      <td>Quick review and revision</td>
    </tr>
  </tbody>
</table>

## Workspace README

Give your AI standing instructions for the entire workspace. The content of the Workspace README is passed to the AI as default context at the start of every session, and it is prioritized and followed on every query. It works as a basic instruction guard.

Example:

- `Always answer in simple English.`
- `Use similar or almost similar wording as the sources you're pulling from, since my exams usually follow the same phrasing as the modules.`
- `Stay close to the original wording of the sources you pull from. This helps me remember key terms and actively digest my educational modules.`

> This feature is toggleable. Turn it on or off anytime from the workspace settings.

## Constraints

⚠ Each workspace has a limit of <strong>40 MB</strong> file uploads per workspace

⚠ Currently supported file formats for workspace document uploads are: <strong>PDF, DOCX, PPTX, TXT</strong>
