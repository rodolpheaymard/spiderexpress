const path = require('path');
const fs = require('fs');


const datamodelpath = './functions/data/datamodel.json';

class Model 
{
  constructor() 
  {
    try {
      if (fs.existsSync(datamodelpath) === true)
      {
        const data = fs.readFileSync(datamodelpath);
        this.datamodel = JSON.parse(data);  
      }
      else
      {
        this.initModel();
      }                      
    } catch (error) {
      console.log('An error has occurred while loading ', error);
    }
  }

  
  ensureDirectoryExistence(filePath) 
  {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }

  save()
  {
    try {    
      this.ensureDirectoryExistence(datamodelpath);
      fs.writeFileSync(datamodelpath, JSON.stringify(this.datamodel), 'utf8');
      console.log('Data successfully saved to disk');
    } catch (error) {
      console.log('An error has occurred while saving', error);
    }  
  }

  initModel()
  {
    this.datamodel = { objects : [] };

    // let's start wih a few users,  at least an admin !
    this.datamodel.objects.push({ "id":"user-0","type":"user",
                                  "username":"admin","password":"admin2","isadmin":true});
    this.datamodel.objects.push({ "id":"user-1","type":"user",
                                  "username":"camille","password":"camille","isadmin":false});
    this.datamodel.objects.push({ "id":"user-2","type":"user",
                                  "username":"iris","password":"iris","isadmin":false});

    this.save();
  }

  login(username, password)
  {
    let user = null;
    let result = false;
    let message = "login not found"; 
    this.datamodel.objects.forEach(element => {
      if (element.type === "user")
      {
        if (element.username === username )
        {
          if (element.password === password)
          {
            result =  true;
            message = "";
            user = {username : element.username, isadmin : element.isadmin } ;
            return;
          }
          else
          {
            result = false;
            message = "bad password";
            return;
          }
        }
      }
    });
    return { response : result , message : message, user: user };
  }

  addObject(obj , objtype)
  {
    if (obj.id === null || obj.id  === undefined)
    {
      obj.id = objtype + "-" + this.datamodel.objects.length;
    }
    obj.type = objtype;
    obj.deleted = false;
    this.datamodel.objects.push(obj);
    this.save();

    return obj;
  }

  getObjects(objtype)
  {
    let result = [];
    if (objtype === null || objtype  === undefined)
    {
      return result;
    }

    this.datamodel.objects.forEach(element => {
      if (element.type === objtype 
          && element.deleted === false)
      {
        result.push(element);
      }
    });

    return result;
  }


  removeObject(id)
  {
    this.datamodel.objects.forEach(element => {
    if (element.id === id )
    {
      element.deleted = true;
    }
    });
  }


}

module.exports = Model;


