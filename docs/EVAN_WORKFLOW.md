# Evan's Workflow Meta Prompt

## Purpose

Use this workflow to separate planning, development, review, and maintenance into repeatable steps when working with AI coding tools such as Codex, Claude, Cursor, or other agents.

---

## 1. Planning

Handle these steps in the same session.

### Office Hour

Use the gstack `/office-hour` style:

```text
/office-hour 나는 지금 <프롬프트> 를 하려고 해 여기에 대해서 처리해줘
```

Goal: clarify the intent, identify risks, and refine the target outcome before implementation.

### Brainstorming

Use the superpowers `/brainstorming` style:

```text
/brainstorming 이 때 까지 했던 내용을 기반으로 처리 해줘
```

Goal: explore options, alternatives, constraints, and missing decisions based on the current project context.

### Grill With Docs

Use Matt Pocock's `grill with docs` style:

```text
/gril-with-docs 로 이 스펙에 대해서 처리해줘
```

Goal: stress-test the spec against the actual project documents, implementation constraints, and likely edge cases.

### Writing Plan

Finish planning with:

```text
/writing-plan 으로 플랜 작성해줘
```

Goal: produce a concrete implementation plan that can be handed to a separate development session.

### Planning Output

When the spec document is ready, save it in the repository under `docs/`.

Recommended files:

```text
docs/PROJECT_PLAN.md
docs/IMPLEMENTATION_PLAN.md
docs/REVIEW_NOTES.md
```

---

## 2. Development

Use a different session for implementation.

Prompt pattern:

```text
@플랜문서 /superpowers:writing-plans 이어서 작성해놔 /subagent-driven-development 로 개발하고 코덱스로 리뷰해줘 /codex:review
```

Equivalent Codex-native instruction:

```text
docs/IMPLEMENTATION_PLAN.md를 기준으로 구현을 진행해줘. 작업을 작은 단계로 나누고, 각 단계마다 검증해. 구현 후 코드 리뷰 관점으로 버그, 리스크, 누락된 테스트를 먼저 점검해줘.
```

Development rules:

- Read the relevant plan document first.
- Keep implementation scoped to the plan.
- Prefer existing project patterns over new abstractions.
- Validate with lint/build/tests before finishing.
- Commit and push only after verification when the project is Git-connected.

---

## 3. Maintenance

Use a separate session for refactoring and maintenance.

Reference prompts:

```text
/improve-codebase-architecture 이용해서 코드베이스 리팩토링 해줘
/vercel-react-best-practices /nextjs-frontend-guidelines 이용해서 코드 베이스 리팩토링 해줘
/fastapi-backend-guidelines 이용해서 코드베이스 리팩토링 해줘
```

Equivalent Codex-native instruction:

```text
현재 코드베이스를 유지보수 관점에서 리뷰해줘. 아키텍처, Next.js/Vercel 배포 안정성, React 프론트엔드 구조, 백엔드/API 경계, 보안/환경변수 관리를 기준으로 리팩토링 제안을 우선순위별로 정리하고, 승인된 범위만 구현해줘.
```

Maintenance rules:

- Start with review findings, not refactoring.
- Separate functional changes from cosmetic cleanup.
- Avoid broad rewrites unless the plan explicitly calls for them.
- Preserve production behavior unless a bug fix requires a behavior change.
- Validate after every meaningful change.

---

## 4. Codex Usage Notes

The slash commands above may not exist as native Codex commands in every environment. When they are unavailable, use the equivalent plain-language Codex prompts in this document.

Recommended trigger phrase:

```text
Evan workflow로 이 작업을 기획부터 구현 플랜까지 정리해줘.
```

For Travel DR.K, always consider these context files first:

```text
docs/PROJECT_PLAN.md
docs/EVAN_WORKFLOW.md
app/CLAUDE.md
app/DESIGN.md
```
