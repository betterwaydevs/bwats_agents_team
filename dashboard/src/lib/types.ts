export type TaskStatus = "pending" | "in-progress" | "blocked" | "done" | "dev-complete" | "not started";

export type TaskType = "BACK" | "FRONT" | "BOTH" | "EXT" | "TEST" | "FRONT/INFRA";

export type Priority = "high" | "medium" | "low" | "quick-fix" | "intern" | "dev-complete" | "completed";

export interface BacklogTask {
  id: string;
  title: string;
  type: TaskType | string;
  status: TaskStatus | string;
  owner: string;
  specLink: string;
  priority: Priority;
  completed?: string; // date for completed tasks
}

export interface SpecFile {
  id: string;
  filename: string;
  content: string;
  htmlContent: string;
  metadata: {
    title: string;
    priority: string;
    type: string;
    projects: string;
  };
  checkboxes: {
    total: number;
    checked: number;
  };
}

export interface ProgressFile {
  id: string;
  filename: string;
  content: string;
  htmlContent: string;
  sessions: ProgressSession[];
}

export interface ProgressSession {
  date: string;
  title: string;
  status: string;
  content: string;
}

export interface ReportFile {
  taskId: string;
  filename: string;
  title: string;
  taskTitle?: string;
  size: number;
  modified: string;
  path: string;
}

export interface ScreenshotFile {
  filename: string;
  taskId?: string;
  taskTitle?: string;
  url: string;
  modified: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DeliveryStage {
  role: string;
  label: string;
  status: string;
  agent: string;
  date: string;
  notes: string;
  commits: string[];
  screenshots: string[];
  report: string;
}

export interface DeliveryLog {
  id: string;
  filename: string;
  stages: DeliveryStage[];
  content: string;
}
