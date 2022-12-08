const express = require("express");
const router = express.Router();

const Model = require('./model');

const mymodel = new Model();

router.get("/", (req, res) => {
       res.json(" This data server is working for you ");
   });


router.get("/api/login/:username/:password", (req,res)=>{
    let result = mymodel.login(req.params.username, req.params.password);
    res.json(result);
}
)
router.get("/api/all/:objecttype", (req,res)=>{
  let result = mymodel.getObjects(req.params.objecttype);
  res.json(result);
})

router.get("/api/all/:objecttype1/:objecttype2", (req,res)=>{
  let result1 = mymodel.getObjects(req.params.objecttype1);
  let result2 = mymodel.getObjects(req.params.objecttype2);

  res.json({ list1 : result1, list2 : result2});
})

router.get("/api/all/:objecttype1/:objecttype2/:objecttype3", (req,res)=>{
  let result1 = mymodel.getObjects(req.params.objecttype1);
  let result2 = mymodel.getObjects(req.params.objecttype2);
  let result3 = mymodel.getObjects(req.params.objecttype3);

  res.json({ list1 : result1, list2 : result2, list3 : result3});
})

router.post('/api/add/:objecttype', (req, res) => {
  let newobj = req.body;
  mymodel.addObject(newobj, req.params.objecttype);
  res.json(newobj);
  });
  
router.post('/api/remove/:objectid', (req, res) => {
  mymodel.removeObject(req.params.objectid);
  res.json(newobj);
  });  
      

router.use((req, res) => {
            res.status(404);
            res.json({
                error: "API not found"
            });
        });
     
 module.exports = router;