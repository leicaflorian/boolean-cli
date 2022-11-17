export type ScaffoldFile = 'html' | 'css' | 'js' | 'img';

export interface ScaffoldOptions {
  html?: string | boolean;
  css?: string | boolean;
  js?: string | boolean;
  img?: boolean;
  readme?: boolean;
  all?: boolean;
}

export interface WizardResult {
  project_name: string;
  files_to_create: ScaffoldFile[];
  html_file_name: string;
  css_file_name: string;
  js_file_name: string;
}
