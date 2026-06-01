import type { ToolId, UseCase } from "@audit/types/index";

export const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

export interface ToolFormOption {
  toolId: ToolId;
  name: string;
  plans: { id: string; label: string }[];
}

export const TOOL_FORM_OPTIONS: ToolFormOption[] = [
  {
    toolId: "cursor",
    name: "Cursor",
    plans: [
      { id: "hobby", label: "Hobby" },
      { id: "pro", label: "Pro" },
      { id: "pro+", label: "Pro+" },
      { id: "ultra", label: "Ultra" },
      { id: "business", label: "Business" },
      { id: "enterprise", label: "Enterprise" },
    ],
  },
  {
    toolId: "github-copilot",
    name: "GitHub Copilot",
    plans: [
      { id: "individual", label: "Individual" },
      { id: "business", label: "Business" },
      { id: "enterprise", label: "Enterprise" },
    ],
  },
  {
    toolId: "claude",
    name: "Claude",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro" },
      { id: "max", label: "Max" },
      { id: "team", label: "Team" },
      { id: "enterprise", label: "Enterprise" },
      { id: "api-direct", label: "API direct" },
    ],
  },
  {
    toolId: "chatgpt",
    name: "ChatGPT",
    plans: [
      { id: "plus", label: "Plus" },
      { id: "team", label: "Team" },
      { id: "enterprise", label: "Enterprise" },
      { id: "api-direct", label: "API direct" },
    ],
  },
  {
    toolId: "anthropic-api",
    name: "Anthropic API",
    plans: [{ id: "api-direct", label: "Pay-as-you-go" }],
  },
  {
    toolId: "openai-api",
    name: "OpenAI API",
    plans: [{ id: "api-direct", label: "Pay-as-you-go" }],
  },
  {
    toolId: "gemini",
    name: "Gemini",
    plans: [
      { id: "pro", label: "Pro" },
      { id: "ultra", label: "Ultra" },
      { id: "api", label: "API" },
    ],
  },
  {
    toolId: "windsurf",
    name: "Windsurf",
    plans: [
      { id: "pro", label: "Pro" },
      { id: "max", label: "Max" },
      { id: "teams", label: "Teams" },
      { id: "enterprise", label: "Enterprise" },
    ],
  },
];

export const FORM_STORAGE_KEY = "ai-spend-audit-form-v1";

export interface FormToolRow {
  id: string;
  toolId: ToolId;
  plan: string;
  monthlySpend: string;
  seats: string;
}

export interface PersistedFormState {
  teamSize: string;
  useCase: UseCase;
  tools: FormToolRow[];
}

export function createEmptyToolRow(): FormToolRow {
  return {
    id: crypto.randomUUID(),
    toolId: "cursor",
    plan: "pro",
    monthlySpend: "",
    seats: "1",
  };
}

export const DEFAULT_FORM_STATE: PersistedFormState = {
  teamSize: "5",
  useCase: "coding",
  tools: [createEmptyToolRow()],
};
