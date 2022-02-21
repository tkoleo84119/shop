const express = require('express')
require('dotenv').config()

const app = express()

const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => console.log(`The app is listening on port ${port}`))
