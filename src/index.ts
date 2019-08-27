import fs from 'fs';
import util from 'util';
import { ColumnError, CsvError, LasError, PathError, PropertyError } from './error';
import isNode from './isnode';
let fsprom: Function;

if (isNode) {
  fsprom = util.promisify(fs.readFile);
}

interface WellProps {
  [key: string]: { unit: string; value: string; description: string };
}

export default class Lasjs {
  private static chunk<T>(arr: T[], size: number): T[][] {
    const overall = [];
    let index = 0;
    while (index < arr.length) {
      overall.push(arr.slice(index, index + size));
      index += size;
    }
    return overall;
  }

  private static removeComment(str: string): string {
    return str
      .trim()
      .split('\n')
      .map(val => val.trimLeft())
      .filter(f => !(f.charAt(0) === '#'))
      .join('\n');
  }
  private static convertToValue(s: string): number | string {
    return Boolean(+s) ? +s : s;
  }

  public path: string | Blob;
  public blobString: Promise<string | void>;

  constructor(path: string) {
    this.path = path;
    this.blobString = this.initialize();
  }

  /**
   * Returns a column in a las file
   * @param {string} column - name of column
   * @returns {(Promise<Array<string| number>>)}
   * @memberof Lasjs
   */
  public async column(str: string): Promise<Array<string | number>> {
    const hds = await this.header();
    const sB = await this.data();
    const index = hds.findIndex(item => item === str);
    if (index < 0) {
      throw new ColumnError(str);
    }
    return sB.map(c => c[index]);
  }

  /**
   * Returns a column in a las file stripped off null values
   * @param {string} column - name of column
   * @returns {(Promise<Array<string| number>>)}
   * @memberof Lasjs
   */
  public async columnStripped(column: string): Promise<Array<string | number>> {
    const hds = await this.header();
    const sB = await this.dataStripped();
    const index = hds.findIndex(item => item === column);
    if (index >= 0) {
      return sB.map(c => c[index]);
    } else {
      throw new ColumnError(column);
    }
  }

  /**
   * Returns a csv File object in browser and writes csv file to current working driectory in Node
   * @param {string} filename
   * @returns {(Promise<File | void>)}
   * @memberof Lasjs
   */
  public async toCsv(filename = 'file'): Promise<File | void> {
    try {
      const headers = await this.header();
      const data = await this.data();
      const rHd = headers.join(',') + '\n';
      const rData = data.map(d => d.join(',')).join('\n');
      if (isNode) {
        fs.writeFile(`${filename}.csv`, rHd + rData, 'utf8', err => {
          if (err) {
            throw new CsvError();
          }
          console.log(`${filename}.csv has been saved to current working directory`);
        });
      } else {
        const file = new File([rHd + rData], `${filename}.csv`);
        return file;
      }
    } catch (error) {
      throw new CsvError();
    }
  }

  /**
   * Returns a csv File object in browser and writes csv file to current working driectory in Node of data stripped of null values
   * @param {string} filename
   * @returns {(Promise<File | void>)}
   * @memberof Lasjs
   */
  public async toCsvStripped(filename = 'file'): Promise<File | void> {
    try {
      const headers = await this.header();
      const data = await this.dataStripped();
      const rHd = headers.join(',') + '\n';
      const rData = data.map(d => d.join(',')).join('\n');
      if (!isNode) {
        const file = new File([rHd + rData], `${filename}.csv`);
        return file;
      }
      fs.writeFile(`${filename}.csv`, rHd + rData, 'utf8', err => {
        if (err) {
          throw new CsvError();
        }
        console.log(`${filename}.csv has been saved to current working directory`);
      });
    } catch (error) {
      throw new CsvError();
    }
  }
  /**
   * Returns the number of rows in a .las file
   * @returns number
   * @memberof Lasjs
   */
  public async rowCount(): Promise<number> {
    const l = await this.data();
    return l.length;
  }

  /**
   * Returns the number of columns in a .las file
   * @returns number
   * @memberof Lasjs
   */
  public async columnCount(): Promise<number> {
    const l = await this.header();
    return l.length;
  }

  /**
   * Returns a two-dimensional array of data in the log
   * @returns {(Promise<Array<Array<string | number>>>)}
   * @memberof Lasjs
   */
  public async data(): Promise<Array<Array<string | number>>> {
    const s = await this.blobString;
    const hds = await this.header();
    const totalheadersLength = hds.length;
    const sB = (s as string)
      .split(/~A(?:\w*\s*)*\n/)[1]
      .trim()
      .split(/\s+/)
      .map(m => Lasjs.convertToValue(m.trim()));
    if (sB.length < 0) {
      throw new LasError('No data/~A section in the file');
    }
    const con = Lasjs.chunk(sB, totalheadersLength);
    return con;
  }

  /**
   * Returns a two-dimensional array of data in the log with all rows containing null values stripped off
   * @returns {(Promise<Array<Array<string | number>>>)}
   * @memberof Lasjs
   */
  public async dataStripped(): Promise<Array<Array<string | number>>> {
    const s = await this.blobString;
    const hds = await this.header();
    const well = await this.property('well');
    const nullValue = well.NULL.value;
    const totalheadersLength = hds.length;
    const sB = (s as string)
      .split(/~A(?:\w*\s*)*\n/)[1]
      .trim()
      .split(/\s+/)
      .map(m => Lasjs.convertToValue(m.trim()));
    if (sB.length < 0) {
      throw new LasError('No data/~A section in the file');
    }
    const con = Lasjs.chunk(sB, totalheadersLength);
    const filtered = con.filter(f => !f.some(x => x === +nullValue));
    return filtered;
  }

  /**
   * Returns the version number of the las file
   * @returns {Promise<number>}
   * @memberof Lasjs
   */
  public async version(): Promise<number> {
    const v = await this.metadata();
    return v[0];
  }

  /**
   * Returns true if the las file is of wrapped variant and false otherwise
   * @returns {Promise<boolean>}
   * @memberof Lasjs
   */
  public async wrap(): Promise<boolean> {
    const v = await this.metadata();
    return v[1];
  }

  /**
   * Returns an extra info about the well stored in ~others section
   * @returns {Promise<string>}
   * @memberof Lasjs
   */
  public async other(): Promise<string> {
    const s = await this.blobString;
    const som = (s as string).split(/~O(?:\w*\s*)*\n\s*/i)[1];
    let str = '';
    if (som) {
      const some = som
        .split('~')[0]
        .replace(/\n\s*/g, ' ')
        .trim();
      str = Lasjs.removeComment(some);
    }
    if (str.length <= 0) {
      throw new LasError('No ~other section');
    }
    return str;
  }

  /**
   * Returns an array of strings of the logs header/title
   * @returns {Promise<string[]>}
   * @memberof Lasjs
   */
  public async header(): Promise<string[]> {
    const s = await this.blobString;
    const sth = (s as string).split(/~C(?:\w*\s*)*\n\s*/)[1].split('~')[0];
    const uncommentedSth = Lasjs.removeComment(sth).trim();
    if (uncommentedSth.length < 0) {
      throw new LasError('There is no header in the file');
    }
    return uncommentedSth.split('\n').map(m => m.trim().split(/\s+|[.]/)[0]);
  }

  /**
   * Returns an object each well header and description as a key-value pair
   * @returns {Promise<{[key:string]: string}>}
   * @memberof Lasjs
   */
  public async headerAndDescr(): Promise<{
    [key: string]: string;
  }> {
    const cur = (await this.property('curve')) as object;
    const hd = Object.keys(cur);
    const descr = Object.values(cur).map(c => c.description);
    const obj: { [key: string]: string } = {};
    hd.map((_, i) => (obj[hd[i]] = descr[i]));
    if (Object.keys(obj).length < 0) {
      throw new LasError('Poorly formatted ~curve section in the file');
    }
    return obj;
  }

  /**
   * Returns details of  well parameters.
   * @returns {Promise<WellProps>}
   * @memberof Lasjs
   */
  public async wellParams(): Promise<WellProps> {
    return this.property('well');
  }

  /**
   * Returns details of  curve parameters.
   * @returns {Promise<WellProps>}
   * @memberof Lasjs
   */
  public async curveParams(): Promise<WellProps> {
    return this.property('curve');
  }

  /**
   * Returns details of  parameters of the well.
   * @returns {Promise<WellProps>}
   * @memberof Lasjs
   */
  public async logParams(): Promise<WellProps> {
    return this.property('param');
  }

  private async metadata(): Promise<[number, boolean]> {
    const str = await this.blobString;
    const sB = (str as string)
      .trim()
      .split(/~V(?:\w*\s*)*\n\s*/)[1]
      .split(/~/)[0];
    const sw = Lasjs.removeComment(sB);
    const refined = sw
      .split('\n')
      .map(m => m.split(/\s{2,}|\s*:/).slice(0, 2))
      .filter(f => Boolean(f));
    const res = refined.map(r => r[1]);
    const wrap = res[1].toLowerCase() === 'yes' ? true : false;
    if ([+res[0], wrap].length < 0) {
      throw new LasError("Couldn't get metadata");
    }
    return [+res[0], wrap];
  }

  private async property(p: string): Promise<WellProps> {
    const regDict: { [key: string]: string } = {
      curve: '~C(?:\\w*\\s*)*\\n\\s*',
      param: '~P(?:\\w*\\s*)*\\n\\s*',
      well: '~W(?:\\w*\\s*)*\\n\\s*'
    };
    const regExp = new RegExp(regDict[p], 'i');
    const str = await this.blobString;
    const substr = (str as string).split(regExp);
    let sw = '';
    if (substr.length > 1) {
      const res = substr[1].split(/~/)[0];
      sw = Lasjs.removeComment(res);
    }
    if (sw.length > 0) {
      const s: WellProps = {};
      sw.split('\n').map(c => {
        const obj = c.replace(/\s*[.]\s+/, '   none   ');
        const title = obj.split(/[.]|\s+/)[0];
        const unit = obj
          .trim()
          .split(/^\w+\s*[.]*s*/)[1]
          .split(/\s+/)[0];
        const description = Boolean(obj.split(/[:]/)[1].trim()) ? obj.split(/[:]/)[1].trim() : 'none';
        const third = obj.split(/[:]/)[0].split(/\s{2,}\w*\s{2,}/);
        const value =
          third.length > 2 && !Boolean(third[third.length - 1]) ? third[third.length - 2] : third[third.length - 1];
        s[title] = { unit, value, description };
      });
      return s;
    } else {
      throw new PropertyError(p);
    }
  }

  private async initialize(): Promise<string | void> {
    if (isNode) {
      try {
        const str = await fsprom(this.path as string, 'utf8');
        return str as string;
      } catch (error) {
        throw new PathError();
      }
    } else {
      if (this.path instanceof File) {
        const reader = new FileReader();
        reader.readAsText(this.path as Blob);
        reader.onerror = (): void => {
          throw new PathError();
        };
        reader.onload = (): string => {
          return reader.result as string;
        };
      } else {
        try {
          const val = await fetch(this.path as string);
          const text = await val.text();
          return text;
        } catch (error) {
          throw new PathError();
        }
      }
    }
  }
}
