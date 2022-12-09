const AWS = require("aws-sdk");










class AwsModel 
{
  constructor() 
  {
    this.datamodel = { objects : [] , loaded : false, lastmodif : null};
    
    try {
       this.init_aws();
       this.load_all();
    } catch (error) {
      console.log('An error has occurred while loading ', error);
    }
  }
  
  init_aws()
  {
    this.awsConfig = {
      "region" :"us-east-1",
      "endpoint"  : "http://dynamodb.us-east-1.amazonaws.com",
      "accessKeyId" : "AKIAXDVH7GI3FJTH565X",
      "secretAccessKey" : "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"
    };

    AWS.config.update(this.awsConfig);
    console.log("aws init ok ");
  }

  load_object(id)
  {
    let docClient = new AWS.DynamoDB.DocumentClient();
    
    var params = {
      TableName : "spider_data",
      Key : { spider_id : id }
    };
  
    console.log("aws loading data ");
    docClient.get(params, function (err,data) {
      if (err) {
        console.log("aws error : "+ JSON.stringify(err,null, 2));
      } else {
        console.log("aws success : "+ JSON.stringify(data,null, 2));    
      }
  
    });    
  }
  
  load_all()
  {
    let docClient = new AWS.DynamoDB.DocumentClient();
    
    docClient.scan({
      TableName: "spider_data",
    })
    .promise()
    .then(data => {
      console.log(data.Items);

      // this.datamodel.lastmodif = ;
      data.Items.forEach( itm => {
        
        let obj = {id : itm.spider_id, type : itm.spider_type, deleted : itm.spider_deleted } ;
        let content = JSON.parse(itm.spider_content);
        let fullobj = { ...obj, ...content };

        this.datamodel.objects.push(fullobj);
        console.log( " obj :   " + JSON.stringify(fullobj));
      });      

      this.datamodel.loaded = true;   
    })
    .catch(console.error)


/**   var params = {
      ExpressionAttributeValues: {
        ':i': 2,
        ':e': 9,
        ':topic': 'PHRASE'
      },
    KeyConditionExpression: 'spider_id begins_with(form)',
    FilterExpression: '',
    TableName: 'spider_data'
    };

    docClient.query(params, function(err, data) {
      if (err) {
        console.log("aws error", err);
      } else {
        console.log("aws success", data.Items);
      }
  }); */
  }


  save_all()
  {
    try {    
      this.datamodel.lastmodif = new Date();

       // write modified ata to aws

    } catch (error) {
      console.log('An error has occurred while saving', error);
    }  
  }

  save_object(obj)
  {
    try {    
      this.datamodel.lastmodif = new Date();
       // write modified ata to aws

    } catch (error) {
      console.log('An error has occurred while saving', error);
    }  
  }

  initFirstTimeModel()
  {
    this.datamodel = { objects : [] };

    // let's start wih a few users,  at least an admin !
    this.datamodel.objects.push({ "id":"user-0","type":"user","deleted":false,
                                  "username":"admin","password":"admin2","isadmin":true});
    this.datamodel.objects.push({ "id":"user-1","type":"user","deleted":false,
                                  "username":"camille","password":"camille","isadmin":false});
    this.datamodel.objects.push({ "id":"user-2","type":"user","deleted":false,
                                  "username":"iris","password":"iris","isadmin":false});

    this.save_all();
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
    this.save_object(obj);

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
          this.save_object(element);
        }
      }
    });
  }


}

module.exports = AwsModel;


