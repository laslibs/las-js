## Structure of las libraries - Guideline for adding new libraries

### Each library/package for a specific language has the following attributes:

> [Las 2.0 Specification](http://www.cwls.org/wp-content/uploads/2017/02/Las2_Update_Feb2017.pdf)

- Exports a class/factory function/struct called **Las** that can be used for initialising the parser
  taking path/blob of the _las_ as its only argument.

- Attached to **Las** are the following public instance methods/equivalents depending on the language.

```Js
  export class Las {
  // instance variables - private
  path: string | File;
  blobString: Promise<string | void>;

  /**
   * Creates an instance of Las.
   * @param {string} path - Absolute path to las file
   * @memberof Las
   */
  constructor(path: string | File);


  /**
   * Returns a column in a las file
   * @param {string} column - name of column
   * @returns {(Promise<Array<string| number>>)}
   * @memberof Las
   */
  column(column: string): Promise<Array<string | number>>;


  /**
   * Returns a column in a las file stripped off null values
   * @param {string} column - name of column
   * @returns {(Promise<Array<string| number>>)}
   * @memberof Las
   */
  columnStripped(column: string): Promise<Array<string | number>>;


  /**
   * Returns a csv File object in browser | writes csv file to current working driectory in Node
   * @param {string} filename
   * @returns {(Promise<File | void>)}
   * @memberof Las
   */
  toCsv(filename?: string): Promise<File | void>;


  /**
   * Returns a csv File object in browser and writes csv file to current working driectory in Node of data stripped of null values
   * @param {string} filename
   * @returns {(Promise<File | void>)}
   * @memberof Las
   */
  toCsvStripped(filename?: string): Promise<File | void>;


  /**
   * Returns the number of rows in a .las file
   * @returns number
   * @memberof Las
   */
  rowCount(): Promise<number>;


  /**
   * Returns the number of columns in a .las file
   * @returns number
   * @memberof Las
   */
  columnCount(): Promise<number>;


  /**
   * Returns a two-dimensional array of data in the log
   * @returns {(Promise<Array<Array<string | number>>>)}
   * @memberof Las
   */
  data(): Promise<Array<Array<string | number>>>;


  /**
   * Returns a two-dimensional array of data in the log with all rows containing null values stripped off
   * @returns {(Promise<Array<Array<string | number>>>)}
   * @memberof Las
   */
  dataStripped(): Promise<Array<Array<string | number>>>;


  /**
   * Returns the version number of the las file
   * @returns {Promise<number>}
   * @memberof Las
   */
  version(): Promise<number>;


  /**
   * Returns true if the las file is of wrapped variant and false otherwise
   * @returns {Promise<boolean>}
   * @memberof Las
   */
  wrap(): Promise<boolean>;


  /**
   * Returns an extra info about the well stored in ~others section
   * @returns {Promise<string>}
   * @memberof Las
   */
  other(): Promise<string>;


  /**
   * Returns an array of strings of the logs header/title
   * @returns {Promise<string[]>}
   * @memberof Las
   */
  header(): Promise<string[]>;


  /**
   * Returns an object, each well header and description as a key-value pair
   * @returns {Promise<{[key:string]: string}>}
   * @memberof Las
   */
  headerAndDescr(): Promise<{
      [key: string]: string;
  }>;


  /**
   * Returns details of  well parameters.
   * @returns {Promise<WellProps>}
   * @memberof Las
   */
  wellParams(): Promise<WellProps>;


  /**
   * Returns details of  curve parameters.
   * @returns {Promise<WellProps>}
   * @memberof Las
   */
  curveParams(): Promise<WellProps>;


  /**
   * Returns details of  parameters of the well.
   * @returns {Promise<WellProps>}
   * @memberof Las
   */
  logParams(): Promise<WellProps>;
}
```

An example of implementation of the above methods in Typescript can be found in [Here](/src/index.ts)
The methods uses pattern matching(Regular Expresion) to target path of the file they want to extract and parse. Check Las 2.0 specification for more - link above.

- Customs errors that can be thrown at different situations are:

```Js

  export class LasError {
      name: string;
      message: string;
      constructor(message: string);
  }

  export class ColumnError {
      message: string;
      name: string;
      constructor(column: string);
  }

  export class PathError {
      message: string;
      name: string;
      constructor();
  }

  export class CsvError {
      message: string;
      name: string;
      constructor();
  }

  export class PropertyError {
      message: string;
      name: string;
      constructor(property: string);
  }

```

An example of implementation of the errors in Typescript can be found in [Here](/src/error.ts)
