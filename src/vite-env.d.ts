/// <reference types="vite/client" />

declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
  }

  interface GanttOptions {
    view_mode?: 'Day' | 'Week' | 'Month';
    date_format?: string;
    language?: string;
    custom_popup_html?: (task: GanttTask) => string;
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: string, end: string) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
    on_view_change?: (mode: string) => void;
  }

  class Gantt {
    constructor(element: HTMLElement, tasks: GanttTask[], options?: GanttOptions);
    change_view_mode(mode: 'Day' | 'Week' | 'Month'): void;
    refresh(tasks: GanttTask[]): void;
  }

  export default Gantt;
}
