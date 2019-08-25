import fs from 'fs';
import util from 'util';
import isNode from './isnode';
const fsprom = util.promisify(fs.readFile);

interface IWellProp {
  [key: string]: { [key: string]: string };
}

export default class Lasjs {
  private static chunk = (arr: any[], size: number) => {
    const overall = [];
    let index = 0;
    while (index < arr.length) {
      overall.push(arr.slice(index, index + size));
      index += size;
    }
    return overall;
  };

  private static removeComment(str: string) {
    return str
      .trim()
      .split('\n')
      .map(val => val.trimLeft())
      .filter(f => !(f.charAt(0) === '#'))
      .join('\n');
  }
  private static convertToValue(s: string) {
    return Boolean(+s) ? +s : s;
  }
  public path: string | Blob;
  public blob: Promise<string | undefined>;
  public data: Promise<any>;
  public dataStripped: Promise<any>;
  public header: Promise<any>;
  public headerAndDescr: Promise<{ [key: string]: string } | undefined>;
  public version: Promise<number | undefined>;
  public wrap: Promise<any>;
  public well: Promise<IWellProp | undefined>;
  public curve: Promise<IWellProp | undefined>;
  public param: Promise<IWellProp | undefined>;
  public other: Promise<string | undefined>;
  public rowCount: Promise<any>;
  public columnCount: Promise<any>;

  constructor(path: string) {
    this.path = path;
    this.blob = this.initialize();
    this.data = this.getData();
    this.dataStripped = this.getDataStripped();
    this.header = this.getHeader();
    this.headerAndDescr = this.getHeaderAndDescr();
    this.version = this.getVersion();
    this.wrap = this.getWrap();
    this.well = this.property('well');
    this.curve = this.property('curve');
    this.param = this.property('param');
    this.other = this.getOther();
    this.rowCount = this.getRowCount();
    this.columnCount = this.getColumnCount();
  }

  public async column(str: string): Promise<number[] | undefined> {
    try {
      const hds = await this.getHeader();
      const sB = await this.getData();
      const index = hds!.findIndex(item => item === str);
      if (index < 0) {
        throw new Error(`Column with title ${str} doesn't exist on the log`);
      }
      return sB!.map(c => c[index]);
    } catch (error) {
      console.log('Problem with getting the column: ', error);
    }
  }

  public async columnStripped(str: string): Promise<number[] | undefined> {
    try {
      const hds = await this.getHeader();
      const sB = await this.getDataStripped();
      const index = hds!.findIndex(item => item === str);
      if (index >= 0) {
        return sB!.map(c => c[index]);
      } else {
        throw new Error(`Column with title ${str} doesn't exist on the log`);
      }
    } catch (error) {
      console.log('Problem with getting the column: ', error);
    }
  }

  public async toCsv(filename: string): Promise<File | undefined> {
    try {
      const headers = await this.getHeader();
      const data = await this.getData();
      const rHd = headers!.join(',') + '\n';
      const rData = data!.map(d => d.join(',')).join('\n');
      if (isNode) {
        fs.writeFile(`${filename}.csv`, rHd + rData, 'utf8', err => {
          if (err) {
            throw err;
          }
          console.log(
            `${filename}.csv has been saved to current working directory`
          );
        });
      } else {
        const file = new File([rHd + rData], `${filename}.csv`);
        return file;
      }
    } catch (error) {
      console.log("Couldn't create csv file", error);
    }
  }

  public async toCsvStripped(filename: string): Promise<File | undefined> {
    try {
      const headers = await this.getHeader();
      const data = await this.getDataStripped();
      const rHd = headers!.join(',') + '\n';
      const rData = data!.map(d => d.join(',')).join('\n');
      if (isNode) {
        fs.writeFile(`${filename}.csv`, rHd + rData, 'utf8', err => {
          if (err) {
            throw err;
          }
          console.log(
            `${filename}.csv has been saved to current working directory`
          );
        });
      } else {
        const file = new File([rHd + rData], `${filename}.csv`);
        return file;
      }
    } catch (error) {
      console.log("Couldn't create csv file", error);
    }
  }

  private async initialize(): Promise<string | undefined> {
    if (isNode) {
      try {
        const str = await fsprom(this.path as string, 'utf8');
        return str;
      } catch (error) {
        throw error;
      }
    } else {
      if (this.path instanceof File) {
        const reader = new FileReader();
        reader.readAsText(this.path as Blob);
        reader.onload = () => {
          return reader.result;
        };
        reader.onerror = () => {
          return reader.error;
        };
      } else {
        try {
          const val = await fetch(this.path as string);
          const text = await val.text();
          return text;
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  private async getRowCount() {
    try {
      const l = await this.getData();
      return l!.length;
    } catch (error) {
      console.log(error);
    }
  }

  private async getColumnCount() {
    try {
      const l = await this.getHeader();
      return l!.length;
    } catch (error) {
      console.log(error);
    }
  }

  private async getData() {
    try {
      const s = await this.blob;
      const hds = await this.getHeader();
      const totalgetHeadersLength = hds!.length;
      const sB = s!
        .split(/~A(?:\w*\s*)*\n/)[1]
        .trim()
        .split(/\s+/)
        .map(m => Lasjs.convertToValue(m.trim()));
      const con = Lasjs.chunk(sB, totalgetHeadersLength);
      return con;
    } catch (error) {
      console.log(error);
    }
  }

  private async getDataStripped() {
    try {
      const s = await this.blob;
      const hds = await this.header;
      const well: any = await this.property('well');
      const nullValue = well.NULL.value;
      const totalgetHeadersLength = hds.length;
      const sB = s!
        .split(/~A(?:\w*\s*)*\n/)[1]
        .trim()
        .split(/\s+/)
        .map(m => Lasjs.convertToValue(m.trim()));
      const con = Lasjs.chunk(sB, totalgetHeadersLength);
      const filtered = con.filter(f => !f.some(x => x === +nullValue));
      return filtered;
    } catch (error) {
      console.log(error);
    }
  }

  private async getVersion(): Promise<number | undefined> {
    try {
      const v = await this.metadata();
      return +v![0];
    } catch (error) {
      console.log(error);
    }
  }

  private async getWrap() {
    try {
      const v = await this.metadata();
      return v![1];
    } catch (error) {
      console.log(error);
    }
  }

  private async metadata() {
    try {
      const str = await this.blob;
      const sB = str!
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
      return [res[0], wrap];
    } catch (error) {
      console.log(error);
    }
  }

  private async property(p: string): Promise<IWellProp | undefined> {
    try {
      const regDict: { [key: string]: string } = {
        curve: '~C(?:\\w*\\s*)*\\n\\s*',
        param: '~P(?:\\w*\\s*)*\\n\\s*',
        well: '~W(?:\\w*\\s*)*\\n\\s*'
      };
      const regExp = new RegExp(regDict[p], 'i');
      const str = await this.blob;
      const substr = str!.split(regExp);
      let sw = '';
      if (substr.length > 1) {
        const res = substr[1].split(/~/)[0];
        sw = Lasjs.removeComment(res);
      }
      if (sw.length > 0) {
        const s: { [key: string]: {} } = {};
        sw.split('\n').map(c => {
          const obj = c.replace(/\s*[.]\s+/, '   none   ');
          const title = obj.split(/[.]|\s+/)[0];
          const unit = obj
            .trim()
            .split(/^\w+\s*[.]*s*/)[1]
            .split(/\s+/)[0];
          const description = Boolean(obj.split(/[:]/)[1].trim())
            ? obj.split(/[:]/)[1].trim()
            : 'none';
          const third = obj.split(/[:]/)[0].split(/\s{2,}\w*\s{2,}/);
          const value =
            third.length > 2 && !Boolean(third[third.length - 1])
              ? third[third.length - 2]
              : third[third.length - 1];
          s[title] = { unit, value, description };
        });
        return s;
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async getOther() {
    try {
      const s = await this.blob;
      const som = s!.split(/~O(?:\w*\s*)*\n\s*/i)[1];
      let str = '';
      if (som) {
        const some = som
          .split('~')[0]
          .replace(/\n\s*/g, ' ')
          .trim();
        str = Lasjs.removeComment(some);
      }
      return str.length > 0 ? str : 'none';
    } catch (error) {
      console.log(error);
    }
  }

  private async getHeader() {
    try {
      const s = await this.blob;
      const sth = s!.split(/~C(?:\w*\s*)*\n\s*/)[1].split('~')[0];
      const uncommentedSth = Lasjs.removeComment(sth).trim();
      return uncommentedSth.split('\n').map(m => m.trim().split(/\s+|[.]/)[0]);
    } catch (error) {
      console.log(error);
    }
  }

  private async getHeaderAndDescr() {
    try {
      const cur = await this.property('curve');
      const hd = Object.keys(!cur);
      const descr = Object.values(!cur).map(c => c.description);
      const obj: { [key: string]: string } = {};
      hd.map((_, i) => (obj[hd[i]] = descr[i]));
      return obj;
    } catch (error) {
      console.log(error);
    }
  }
}
