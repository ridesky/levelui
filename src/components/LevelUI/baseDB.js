import levelup from 'levelup';
import leveldown from 'leveldown';
import path from 'path';
import fs from 'fs';

const ncp = require('ncp').ncp;
ncp.limit = 16;
const {
  app
} = require('electron').remote;
const levelRootPath = path.join(app.getPath("appData"), app.getName(), "levelRootPath")
// import fs from 'fs';

class BaseDB {

  constructor(dbOriginPath, dbName) {
    dbName = dbName || path.basename(dbOriginPath);
    this.dbName = dbName;
    this.dbOriginPath = dbOriginPath;
    this.dbDstPath = path.join(levelRootPath, this.dbName);
  }

  async startDB() {
    this.deleteFolderRecursive(this.dbDstPath);
    this.initDir(levelRootPath)
    await this.copyDir();
    return new Promise((resolve, reject) => {
      this.db = levelup(leveldown(this.dbDstPath), (err) => {
        if (err) {
          console.log('level failed!!');
          console.log(err);
          this.db = null;
          reject();
        } else {
          console.log('level success!');
          resolve();
        }
      });
    })
  }

  copyDir() {
    return new Promise((resolve, reject) => {
      ncp(this.dbOriginPath, this.dbDstPath, {
        filter: function (fileFullPath) {
          console.log('fileFullPath is');
          console.log(fileFullPath);
          path.basename(fileFullPath)
          if (fileFullPath.indexOf('LOCK') >= 0) {
            return false
          } else {
            return true
          }
        }
      }, (err) => {
        if (err) {
          // return console.error(err);
          console.error('copy failed')
          console.log(err)
          reject(err)
          return;
        }
        console.log('done!');
        resolve('done')
      });
    })
  }

  deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(file => {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }




  getAllData() {

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
      const kvLists = {};
      this.db.createReadStream({
          key: true,
          value: true
        })
        .on('data', (data) => {
          kvLists[data.key.toString()] = JSON.parse(data.value);
        }).on('end', () => {
          resolve(kvLists);
        }).on('error', (err) => {
          reject(err);
        })
    })

  }

  close() {

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
      this.db.close(() => {
        console.log('level close!!');
        resolve('I am closed');
      });
    })

  }

  /**
   * 
   * create dirctory if not exist
   * 
   * @param  {...string} dirname 
   *         The directory hierarchy to be built under the g_baseDB directory 
   * 
   */


  initDir(...dirname) {

    const subPath = path.join(...dirname);
    fs.mkdirSync(subPath, {
      recursive: true
    }, err => {
      console.log('subdirname error');
      console.error(err);
    });

  }
}
export default BaseDB;