import express from "express";
import { MongoClient,ObjectId } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config()
import bcrypt from 'bcrypt';
import  Jwt  from "jsonwebtoken";
import cors from 'cors';

const app = express()
const port = process.env.PORT 

  const url=process.env.MONGO_URL;
  const client = new MongoClient(url)
  await client.connect()
  console.log("Database connected successfully")
  
  app.use(cors({
    origin:"*"
  }));

app.use(express.json())
  
app.post("/signin", async function(req,res){
      const {username,email,password} = req.body
  
      const finduser = await client.db("zuppa-auth").collection("private").findOne({email:email})
  
      if (finduser) {
    res.status(400).send( "This user Already exists")
      } else {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password,salt)
         const postSignin = await client.db("zuppa-auth").collection("private").insertOne({username:username,email:email, password:hashedPassword})
    res.status(200).send(postSignin)
      }
  })
  
app.post('/login', async function(req,res){
      const {email,password} = req.body
      const userFind = await client.db("zuppa-auth").collection("private").findOne({email:email})
      if (userFind) {
          const strongPassword = userFind.password;
          const passwordCheck = await bcrypt.compare(password,strongPassword)
          if (passwordCheck) {
              const token = Jwt.sign({id:userFind._id}, "santhiya2525")
              res.status(200).send(token)
          } else {
              res.status(400).send("Invalid Password ")
          }
      } else {
          res.status(400).send("Invalid Email id")
      }
  })
  
  
  app.listen(port,()=>{
  console.log("Server Running Successfully",port)
  })
  