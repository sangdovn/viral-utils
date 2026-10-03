import type { SystemDraft, UpdateSystemErrors } from "@/features/systems/types";

export function normalizeSystemDraft(draft: SystemDraft): SystemDraft {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
  };
}

export function validateSystemDraft(draft: SystemDraft) {
  const errors: UpdateSystemErrors = {};

  if (draft.name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (draft.name.length > 256) {
    errors.name = "Name cannot exceed 256 characters.";
  }

  if (draft.description.length > 10_000) {
    errors.description = "Description cannot exceed 10,000 characters.";
  }

  return errors;
}
