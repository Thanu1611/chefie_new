/** Default app language — Sri Lankan Tamil. */
export const DEFAULT_LANGUAGE = "ta" as const;

/** BCP 47 locale for dates, numbers, and speech. */
export const DEFAULT_LOCALE = "ta-LK" as const;

/** Web Speech API language tag (STT + TTS). */
export const DEFAULT_SPEECH_LANG = "ta-LK" as const;

/** Appended to Gemini system prompts so assistants reply in Tamil. */
export const GEMINI_TAMIL_INSTRUCTION = `LANGUAGE:
- Always respond in Tamil (தமிழ்).
- Use simple spoken Tamil suited to home cooking.
- English cooking terms are fine when there is no common Tamil word.`;
