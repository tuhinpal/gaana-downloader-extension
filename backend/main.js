const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const axios = require('axios')

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}))

app.use(express.json())

app.get('*', (req, res) => {
    res.json({ status: true })
})

app.post('/image', async(req, res) => {
    if (!req.body.url) {
        res.send('Provide URL')
    } else {
        res.set({
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "image/jpeg"
        })
        res.send((await axios(req.body.url, { responseType: 'arraybuffer' })).data)
    }
})

app.post('/converter', (req, res) => {
    if (!req.body.url) {
        res.send('Provide URL')
    } else {
        res.set({
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Headers": "*"
        })
        new ffmpeg()
            .addInput(req.body.url)
            .toFormat('mp3')
            .outputOptions([
                '-ab 128k',
            ])
            .on('error', function(err, stdout, stderr) {
                res.send(err.message).end()
            })
            .on('end', function(err, stdout, stderr) {
                console.log('Finished processing!');
            })
            .pipe(res, { end: true })
    }
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Using PORT: ${port}`)
})