export interface StepAssistantContext {
  dish_name: string;
  step_number: number;
  step_title: string;
  instruction: string;
  timer_minutes: number | null;
  break_time_minutes: number;
}

export interface StepAssistantMessage {
  role: "user" | "assistant";
  content: string;
}
