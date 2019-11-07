export interface I18nText {
  text: string;
  args: (string | null | undefined)[];
  toBeTranslated: boolean;
  length: number;
  key?: string;
}
