const express = require('express');
const puppeteer = require('puppeteer');
const { record } = require('puppeteer-recorder');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (request, response) => {
    return response.status(200).send(`API is running...`);
});


app.post('/', async (request, response) => {
    try {
        const url = request.body.url; // get url
        if (!url) {
            return response.status(400).send(`"url" is required query parameter.`);
        }

        const outputFilePath = path.join(__dirname, `video.webm`);
        const ffmpegPath = path.join(__dirname, `ffmpeg.exe`);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url);

        console.log('recording...');
        await record({
            ffmpeg: ffmpegPath,
            browser: browser,
            page: page,
            output: outputFilePath,
            fps: 24,
            frames: 24 * 10, // 10 seconds at 24 fps
            prepare: function (browser, page) { },
            render: function (browser, page, frame) { }
        });

        console.log('finished...');

        let newName = outputFilePath.replace(".webm", ".mp4");
        fs.renameSync(outputFilePath, newName);

        console.log(`File saved at: ${newName}`);
        response.status(200).send({ file: newName });
        await browser.close();

    } catch (ex) {
        return response.status(500).send(ex.message);
    }
});

const port = 4000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
