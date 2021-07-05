const express = require('express')
const app = express()
const path = require('path')
const multer = require('multer')
const upload = multer({ dest: 'uploads' })
const fs = require('fs')

const s3 = require('s3')
const paramsS3 = {
  s3Options: {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  }
}
const client = s3.createClient(paramsS3)

const aws = require('aws-sdk')
aws.config = new aws.Config({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1'
})
const s3SDK = new aws.S3()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('index'))
app.post('/upload', upload.single('foto'), (req, res) => {
  const params = {
    localFile: req.file.path,
    s3Params: {
      Bucket: 'fsm-devpleno',
      Key: req.file.originalname,
      ContentType: req.file.mimetype,
      //ACL: 'public-read'
    }
  }
  const uploader = client.uploadFile(params)
  uploader.on('end', () => {
    fs.unlinkSync(req.file.path)
    req.file.url = s3.getPublicUrl('fsm-devpleno', req.file.originalname, 'us-east-1')
    const s3File = {
      Bucket: 'fsm-devpleno',
      Key: req.file.originalname,
      Expires: 10
    }
    req.file.signedUrl = s3SDK.getSignedUrl('getObject', s3File)
    res.send(req.file)
  })
})

app.listen(3000, () => console.log('running...'))