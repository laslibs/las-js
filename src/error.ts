export class LasError {
  public name: string;
  public message: string;

  constructor(message: string) {
    this.name = 'LasError';
    this.message = message;
  }
}

export class ColumnError {
  public message: string;
  public name: string;

  constructor(column: string) {
    this.name = 'ColumnError';
    this.message = `Column ${column} doesn't exist in the file`;
  }
}

export class PathError {
  public message: string;
  public name: string;

  constructor() {
    this.name = 'PathError';
    this.message = 'Path is invalid';
  }
}
export class CsvError {
  public message: string;
  public name: string;

  constructor() {
    this.name = 'CsvError';
    this.message = "Couldn't convert file to CSV";
  }
}

export class PropertyError {
  public message: string;
  public name: string;

  constructor(property: string) {
    this.name = 'PropertyError';
    this.message = `Property ${property} doesn't exist`;
  }
}
