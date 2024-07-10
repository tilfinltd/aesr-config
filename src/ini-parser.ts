export interface SectionItem {
  readonly name: string;
  readonly startLine: number;
  readonly params: { [key: string]: string };
}

class SectionItemImpl implements SectionItem {
  public readonly name: string;
  public readonly startLine: number;
  public readonly params: { [key: string]: string };

  constructor(name: string, line: number) {
    this.name = name;
    this.startLine = line;
    this.params = {};
  }

  hasParam(key: string): boolean {
    return key in this.params;
  }

  setParam(key: string, value: string) {
    this.params[key] = value;
  }
}

export class IniParseError extends Error {
  public readonly line: number;
  public readonly text: string;

  constructor(message: string, text: string, line: number) {
    super(message);
    this.text = text;
    this.line = line;
  }
}

export class IniParser {
  #item: SectionItemImpl | null = null;
  #items: SectionItemImpl[] = [];

  parse(text: string): SectionItem[] {
    this.#item = null;
    this.#items = [];

    const textLines = text.split(/\r\n|\r|\n/);
    textLines.forEach((str: string, idx: number) => {
      this.parseLine(str, idx + 1);
    });
    this.appendCurrentItem();

    return this.#items;
  }

  private parseLine(text: string, line: number): void {
    text = text.replace(/[\;\#].*$/, "").trim(); // trim comment and spaces
    if (text.length === 0) return; // skip empty line

    const md = text.match(/^\[(.+)\]$/);
    if (md) {
      this.appendCurrentItem();
      this.#item = new SectionItemImpl(md[1].trim(), line);
    } else if (this.#item) {
      const { key, value } = this.parseKeyValue(text, line);
      if (this.#item.hasParam(key)) {
        throw new IniParseError(
          `The \`${key}\` parameter is duplicated in the same profile.`,
          text,
          line,
        );
      }
      this.#item.setParam(key, value);
    } else {
      throw new IniParseError("Unexpected text", text, line);
    }
  }

  private parseKeyValue(
    text: string,
    line: number,
  ): { key: string; value: string } {
    const [key, val] = text.split("=", 2);
    const value = val ? val.trim() : undefined;
    if (!value)
      throw new IniParseError("Invalid parameter definition", text, line);
    return { key: key.trim(), value };
  }

  private appendCurrentItem() {
    if (!this.#item) return;
    this.#items.push(this.#item);
    this.#item = null;
  }
}
