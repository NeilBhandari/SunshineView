const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==== Config (API Keys) ====
const WEATHER_API_KEY = 'c22bbf59c9ab4e20941223805250104';
const GROQ_API_KEY = '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';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ==== Weather Endpoint ====
app.get('/weather', async (req, res) => {
    const { city } = req.query;

    try {
        // Check if the city is actually a lat,lon pair
        const isLatLon = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(city);
        const query = isLatLon ? city : encodeURIComponent(city);

        const response = await axios.get(WEATHER_API_URL, {
            params: {
                key: WEATHER_API_KEY,
                q: query,
                days: 3
            }
        });

        res.json(response.data);
    } catch (err) {
        console.error('Weather API Error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Weather API failed',
            details: err.response?.data?.error?.message || err.message
        });
    }
});

// ==== AI Narrative Endpoint ====
app.post('/narrative', async (req, res) => {
    const { location, dayData } = req.body;

    let greeting = "Hello";
    let forecastContext = "today";

    try {
        const localTimeStr = location?.localtime;
        const forecastDateStr = dayData?.date;

        if (localTimeStr && forecastDateStr) {
            const [, timePart] = localTimeStr.split(' ');
            const currentTime = new Date(`${location.localtime.replace(' ', 'T')}`);
            const hour = currentTime.getHours();
            if (hour >= 5 && hour < 12) greeting = "Good morning";
            else if (hour >= 12 && hour < 18) greeting = "Good afternoon";
            else greeting = "Good evening";

            const forecastDate = new Date(forecastDateStr);
            const currentDate = new Date(localTimeStr.split(' ')[0]);
            const diffDays = Math.round((forecastDate - currentDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                forecastContext = "tomorrow";
            } else if (diffDays >= 2) {
                forecastContext = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
            }
        }
    } catch (err) {
        console.warn('Failed to determine greeting or day context, using defaults.');
    }

    const trimmedData = {
        location: location?.name,
        country: location?.country,
        greeting,
        forecastContext,
        date: dayData?.date,
        condition: dayData?.day?.condition?.text,
        temperature_c: dayData?.day?.avgtemp_c,
        humidity: dayData?.day?.avghumidity,
        wind_kph: dayData?.day?.maxwind_kph,
        sunrise: dayData?.astro?.sunrise,
        sunset: dayData?.astro?.sunset
    };

    const prompt = `
You're a weather anchor creating a short, friendly forecast writeup using this data:
${JSON.stringify(trimmedData, null, 2)}

Instructions:
- Start with the provided greeting: "${greeting}, ${trimmedData.location}!"
- Then naturally transition with something like: "Here's what to expect ${forecastContext === 'today' ? 'today' : 'on ' + forecastContext}"
- Then describe the weather details in a professional but personality-filled tone
- Keep it under 100 words
- Occasionally use 1–2 fitting emojis
- Include one fun weather-related fact if possible
- Do NOT mention AI, automation, or that this is generated

Return only the weather writeup.
`;

    try {
        const aiRes = await axios.post(GROQ_API_URL, {
            model: 'llama3-70b-8192',
            messages: [{ role: 'user', content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiMessage = aiRes.data.choices[0].message.content;
        res.json({ narrative: aiMessage });
    } catch (err) {
        console.error('Groq API Error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Groq API failed',
            details: err.response?.data?.error?.message || err.message
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
