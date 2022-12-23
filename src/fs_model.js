const fs = require("fs");


class FsModel 
{
  constructor() 
  {
    this.datamodel = { objects : [] , loaded : false, lastmodif : null};
    this.datadirname = "./data/" +  process.env.NODE_ENV.trim() + "/"; 

    try 
    {       
       this.load_all();
    } 
    catch (error) {
      console.log('An error has occurred while loading ', error);
    }
  }


  load_object(id)
  {
    console.log("loading loading data ["+this.datadirname+"]");

    let ficname = this.datadirname + id + ".json";
    this.load_file(ficname);
  }


  load_file(ficname)
  {
    let mdl = this;
    fs.readFile(ficname, 'utf8', function(err, data){

      if (err) {
        console.log('Unable to scan directory: ' + err);
        return;
       } 
         
      let objData = JSON.parse(data);
      mdl.datamodel.objects.push(objData);
    });  
  }
  
  load_all()
  {
    console.log("loading loading data ["+this.datadirname+"]");

    const mdl = this;
    fs.readdir(this.datadirname, function (err, strfiles) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 

      if (strfiles.length == 0)
      {
        console.log("no data found on server , launch init");
        mdl.startup_data();
        return;
      }

      strfiles.forEach(function (datafile) {          
        mdl.load_file(mdl.datadirname + datafile);
      });
    });
  }

  startup_data()
  {
    let usr1 = { "username" : "admin" , "password" : "admin2" , "isadmin" : true};
    let usr2 = { "username" : "camille" , "password" : "camille" , "isadmin" : false};
    let usr3 = { "username" : "iris" , "password" : "iris" , "isadmin" : false};
    
    this.addObject(usr1,"user");
    this.addObject(usr2,"user");
    this.addObject(usr3,"user");
  }

  extract_content(obj)  {
    let duplicatedobj = { ...obj};
    delete duplicatedobj.id;
    delete duplicatedobj.type;
    delete duplicatedobj.deleted;
    let result = JSON.stringify(duplicatedobj);
   
    return result;
  }

  get_timestamp()
  {
    let dt = new Date();
    return dt.toISOString();
  }

  save_object(obj, mode)
  {
    try {    
      this.datamodel.lastmodif = new Date();
      let timestamp = this.get_timestamp();
      let tosave = false;
      switch(mode) {
        case "create" : 
        obj.spider_created_date = timestamp;
        obj.spider_modified_date = timestamp;
        obj.spider_deleted_date = "";
        obj.deleted = false;
        tosave = true;
        break;
        case "update" : 
        obj.spider_modified_date = timestamp;
        obj.spider_deleted_date = "";
        obj.deleted = false;
        tosave = true;
        break;
        case "delete" : 
        obj.spider_deleted_date = timestamp;
        obj.deleted = true;
        tosave = true;
        break;
      }

      if (tosave === true)
      {
        let content = JSON.stringify(obj);
        let filename = this.datadirname + obj.id + ".json";
        fs.writeFile(filename, content,
                      {
                        encoding: "utf8",
                        flag: "w",
                        mode: 0o666
                      },
                      (err) => {
                        if (err)
                          console.log(err);
                        else {
                         // console.log("File " + filename+ " saved successfully");
                        }
                    });
      }
    } catch (error) {
      console.log('An error has occurred while saving', error);
    }  
  }

  ping()
  {
     let result = "spider express server is available for " + this.getObjects("user").length + " users.";
     return result;
  }

  login(username, password)
  {
    let user = null;
    let result = false;
    let message = "login not found"; 
    this.datamodel.objects.forEach(element => {
      if (element.type === "user" && element.deleted === false)
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
    this.save_object(obj,"create");

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
        if (element.type === "user")
        {
          // special case for users :  we do not give password ...
          result.push({ "id" : element.id , 
                        "type" : element.type, 
                        "deleted" : element.deleted,
                        "username" : element.username , 
                        "isadmin" : element.isadmin });    
        }
        else
        {
          result.push(element);    
        }
      }
    });

    return result;
  }

  getAllObjects()
  {
    let result = [];

    this.datamodel.objects.forEach(element => {    
      if (element.type === "user")
      {
        // special case for users :  we do not give password ...
        result.push({ "id" : element.id , "type" : element.type, "deleted" : element.deleted,
                      "username" : element.username , "isadmin" : element.isadmin });    
      }
      else
      {
        result.push(element);
      }
    
    });
    return result;
  }

  getFullDatabase()
  { 
    return this.datamodel;
  }

  removeObject(id)
  {
    this.datamodel.objects.forEach(element => {
      if (element.id === id )
      {
        if ( element.deleted !== true)
        {
          element.deleted = true;      

          this.save_object(element,"delete");
        }
      }
    });
  }


}

module.exports = FsModel;


