/**
 * @author Ikechukwu Eze <github.com/iykekings>
 * @version 2.0.0
 * @license MIT
 * @name Lasjs
 * @summary A performant zero-dependency JavaScript library for reading .las files
 */

// Create chunk in Array prototype
Array.prototype.chunk = function(size) {
  let overall = [];
  let index = 0;
  while (index < this.length) {
    overall.push(this.slice(index, index + size));
    index += size;
  }
  return overall;
};
//End of prototype method

class Lasjs {
  /**
   * @param {(File|URL)} path - An instance of File or a URL to a .Las file
   * @example
   * let myLas = new ReadLas('./path-to-my-las-file.las')
   * Or
   * const file = document.getElementById('file-input')files[0]
   * let myLas = new ReadLas(file)
   */

  constructor(path) {
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

  async initialize() {
    if (this.path instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(this.path);
        reader.onload = event => {
          resolve(event.target.result);
        };
        reader.onerror = event => {
          reject(event.target.error);
        };
      });
    } else {
      try {
        const val = await fetch(this.path);
        const text = await val.text();
        return text;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getRowCount() {
    try {
      const l = await this.getData();
      return l.length;
    } catch (error) {
      console.log(error);
    }
  }

  async getColumnCount() {
    try {
      const l = await this.getHeader();
      return l.length;
    } catch (error) {
      console.log(error);
    }
  }

  async getData() {
    try {
      const s = await this.blob;
      const hds = await this.getHeader();
      const totalgetHeadersLength = hds.length;
      const sB = s
        .split(/~A(?:\w*\s*)*\n/)[1]
        .trim()
        .split(/\s+/)
        .map(m => Lasjs.convertToValue(m.trim()));
      const con = sB.chunk(totalgetHeadersLength);
      return con;
    } catch (error) {
      console.log(error);
    }
  }

  async getDataStripped() {
    try {
      const s = await this.blob;
      const hds = await this.getHeader();
      const well = await this.property('well');
      const nullValue = well.NULL.value;
      const totalgetHeadersLength = hds.length;
      const sB = s
        .split(/~A(?:\w*\s*)*\n/)[1]
        .trim()
        .split(/\s+/)
        .map(m => Lasjs.convertToValue(m.trim()));
      const con = sB.chunk(totalgetHeadersLength);
      const filtered = con.filter(f => !f.some(x => x == +nullValue));
      return filtered;
    } catch (error) {
      console.log(error);
    }
  }

  static removeComment(str) {
    return str
      .trim()
      .split('\n')
      .map(val => val.trimStart())
      .filter(f => !(f.charAt(0) == '#'))
      .join('\n');
  }

  async column(str) {
    try {
      const hds = await this.getHeader();
      const sB = await this.getData();
      const index = hds.findIndex(item => item === str);
      if (index >= 0) {
        return sB.map(c => c[index]);
      } else {
        throw `Column with title ${str} doesn't exist on the log`;
      }
    } catch (error) {
      console.log('Problem with getting the column: ', error);
    }
  }
  async columnStripped(str) {
    try {
      const hds = await this.getHeader();
      const sB = await this.getDataStripped();
      const index = hds.findIndex(item => item === str);
      if (index >= 0) {
        return sB.map(c => c[index]);
      } else {
        throw `Column with title ${str} doesn't exist on the log`;
      }
    } catch (error) {
      console.log('Problem with getting the column: ', error);
    }
  }

  static convertToValue(s) {
    return Boolean(+s) ? +s : s;
  }

  async getVersion() {
    try {
      const v = await this.metadata();
      return v[0];
    } catch (error) {
      console.log(error);
    }
  }

  async getWrap() {
    try {
      const v = await this.metadata();
      return v[1];
    } catch (error) {
      console.log(error);
    }
  }

  async metadata() {
    try {
      const str = await this.blob;
      const sB = str
        .trim()
        .split(/~V(?:\w*\s*)*\n\s*/)[1]
        .split(/~/)[0];
      const sw = Lasjs.removeComment(sB);
      const refined = sw
        .split('\n')
        .map(m => m.split(/\s{2,}|\s*:/).slice(0, 2))
        .filter(f => Boolean(f));
      let res = refined.map(r => r[1]);
      res[1] == 'Yes' ? (res[1] = true) : (res[1] = false);
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async property(p) {
    try {
      const regDict = {
        param: '~P(?:\\w*\\s*)*\\n\\s*',
        curve: '~C(?:\\w*\\s*)*\\n\\s*',
        well: '~W(?:\\w*\\s*)*\\n\\s*'
      };
      const regExp = new RegExp(regDict[p], 'i');
      const str = await this.blob;
      let substr = str.split(regExp);
      let sw = '';
      if (substr.length > 1) {
        substr = substr[1].split(/~/)[0];
        sw = Lasjs.removeComment(substr);
      }
      if (sw.length > 0) {
        let s = {};
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
          let third = obj.split(/[:]/)[0].split(/\s{2,}\w*\s{2,}/);
          const value =
            third.length > 2 && !Boolean(third[third.length - 1])
              ? third[third.length - 2]
              : third[third.length - 1];
          s[title] = { unit, value, description };
        });
        return s;
      } else {
        return 'none';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getOther() {
    try {
      const s = await this.blob;
      const som = s.split(/~O(?:\w*\s*)*\n\s*/i)[1];
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

  async getHeader() {
    try {
      const s = await this.blob;
      const sth = s.split(/~C(?:\w*\s*)*\n\s*/)[1].split('~')[0];
      const uncommentedSth = Lasjs.removeComment(sth).trim();
      return uncommentedSth.split('\n').map(m => m.trim().split(/\s+|[.]/)[0]);
    } catch (error) {
      console.log(error);
    }
  }

  async getHeaderAndDescr() {
    try {
      const cur = await this.property('curve');
      const hd = Object.keys(cur);
      const descr = Object.values(cur).map(c => c.description);
      let obj = {};
      hd.map((m, i) => (obj[hd[i]] = descr[i]));
      return obj;
    } catch (error) {
      console.log(error);
    }
  }

  async toCsv(filename) {
    try {
      const headers = await this.getHeader();
      const data = await this.getData();
      const rHd = headers.join(',') + '\n';
      const rData = data.map(d => d.join(',')).join('\n');
      const file = new File([rHd + rData], `${filename}.csv`);
      return file;
    } catch (error) {
      console.log("Couldn't create csv file", error);
    }
  }

  async toCsvStripped(filename) {
    try {
      const headers = await this.getHeader();
      const data = await this.getDataStripped();
      const rHd = headers.join(',') + '\n';
      const rData = data.map(d => d.join(',')).join('\n');
      const file = new File([rHd + rData], `${filename}.csv`);
      return file;
    } catch (error) {
      console.log("Couldn't create csv file", error);
    }
  }
}
