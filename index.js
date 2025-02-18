import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const URLDOMAIN = process.env.URLDOMAIN;
const AUTHORIZE_TOKEN = process.env.AUTHORIZE_TOKEN;
const KEYWORDS_FILE = process.env.KEYWORDS_FILE;
const INTERVAL = parseInt(process.env.INTERVAL, 10);

const readKeywords = () => {
    if (!fs.existsSync(KEYWORDS_FILE)) {
        throw new Error("File keywords.txt tidak ditemukan!");
    }
    return fs.readFileSync(KEYWORDS_FILE, 'utf8').split('\n').filter(Boolean);
};

const getRandomKeyword = (keywords) => {
    return keywords[Math.floor(Math.random() * keywords.length)];
};

const sendRequest = async (keyword) => {
    console.log("\n==============================");
    console.log(`🔍 Keyword: ${keyword}`);
    console.log("==============================");
    
    const data = {
        messages: [
            { role: "system", content: "You are an AI assistant." },
            { role: "user", content: keyword }
        ]
    };

    try {
        const response = await fetch(URLDOMAIN, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AUTHORIZE_TOKEN}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error("Error! No response from server");
        }
        
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || "[No response received]";
        
        console.log("✅ Response:");
        console.log("------------------------------");
        console.log(content);
        console.log("------------------------------\n");
    } catch (error) {
        console.error("❌ Error! No response from server");
    }
};

const startLoop = async () => {
    const keywords = readKeywords();
    while (true) {
        const keyword = getRandomKeyword(keywords);
        await sendRequest(keyword);
        console.log(`⏳ Menunggu ${INTERVAL / 1000} detik...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
};

startLoop();
