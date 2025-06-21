require('dotenv').config()

const express = require('express') //common js
// import express from 'express' //module js syntax

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/instagram',(req,res)=>{
    res.send('instagramdotcom')
})

app.get('/login',(req,res)=>{
    res.send("<h1>please login at chai aur code</h1>")
})

app.get('/youtube',(req,res)=>{
    res.send("<h2>chai aur code</h2>")
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
