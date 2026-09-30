export interface OxlintConfig {
  plugins?: string[];
  env?: Record<string, boolean>;
  categories?: Record<string, 'error' | 'warn' | 'off'>;
  rules?: Record<string, unknown>;
  overrides?: Array<{
    files: string[];
    rules?: Record<string, unknown>;
  }>;
}

export interface OxfmtConfig {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'all' | 'es5' | 'none';
  endOfLine?: 'lf' | 'crlf' | 'auto';
  ignorePatterns?: string[];
  sortPackageJson?: boolean;
}

export declare const oxlint: OxlintConfig;
export declare const oxfmt: OxfmtConfig;
