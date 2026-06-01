require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

app.use(cors({
    origin: [
        'https://sumanthcarrentals.com'
    ]
}));
app.use(express.json());

/* GROQ */

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/* TEST ROUTE */

app.get('/', (req, res) => {

    res.send('Groq AI Server Running');

});

/* USER MEMORY */

const userChats = {};

/* CHAT ROUTE */

app.post('/chat', async (req, res) => {

    try {

        const userMessage = req.body.message;
        const userId = req.body.userId || 'default-user';

        console.log('USER:', userMessage);

        if (!userMessage) {

            return res.status(400).json({
                reply: 'Message missing'
            });

        }

        /* CREATE USER CHAT */

        if (!userChats[userId]) {

            userChats[userId] = [

                {
                    role: 'system',

                    content: `

You are a premium AI booking assistant for Sumanth Car Rentals.

IMPORTANT RULES:

- Never greet again after first greeting
- Never repeat questions
- Never restart the conversation
- Continue conversation naturally
- Remember previous user messages
- Ask only ONE question at a time
- Sound like a real booking executive
- Keep responses short and professional

━━━━━━━━━━━━━━━
SERVICES
━━━━━━━━━━━━━━━

- Sedan Rentals
- SUV Rentals
- Tempo Traveller
- Airport Pickup & Drop
- Bangalore Local Trips
- Outstation Trips

━━━━━━━━━━━━━━━
BOOKING FLOW
━━━━━━━━━━━━━━━

STEP 1 → Destination
STEP 2 → Vehicle type
STEP 3 → Trip duration
STEP 4 → Pickup location
STEP 5 → Travel date
STEP 6 → Passenger count
STEP 7 → Pickup timing

After collecting all details:

- Give short trip summary
- Ask customer to call or WhatsApp

━━━━━━━━━━━━━━━
FINAL CTA
━━━━━━━━━━━━━━━

Example:

Perfect! Here's your trip summary:

🚘 Vehicle: Sedan
📍 Pickup: Bangalore
🏔️ Destination: Goa
📅 Duration: 5 Days

Our team will help you with pricing and availability.

📞 Call:
+91 9620849670

                    `
                }

            ];

        }

        /* SAVE USER MESSAGE */

        userChats[userId].push({

            role: 'user',
            content: userMessage

        });

        /* AI RESPONSE */

        const completion =
        await groq.chat.completions.create({

            model: 'llama-3.3-70b-versatile',

            messages: userChats[userId],

            temperature: 0.7,

            max_tokens: 250

        });

        const reply =
        completion.choices[0].message.content;

        /* SAVE BOT MESSAGE */

        userChats[userId].push({

            role: 'assistant',
            content: reply

        });

        /* LIMIT MEMORY */

        if (userChats[userId].length > 20) {

            userChats[userId] =
            userChats[userId].slice(-20);

        }

        res.json({
            reply
        });

    } catch (error) {

        console.log('GROQ ERROR:');
        console.log(error);

        res.status(500).json({

            reply: '⚠️ AI server error'

        });

    }

});

/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server Running on Port ${PORT}`
    );

});
