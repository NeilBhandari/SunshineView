import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [city, setCity] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [weather, setWeather] = useState(null);
    const [narrative, setNarrative] = useState('');
    const [wordArray, setWordArray] = useState([]);
    const [visibleWordCount, setVisibleWordCount] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const GEO_API_KEY = '3d150864b0msh2f86ca80b22dc2ap16dbfajsnaa465ee133f0';

    const fetchSuggestions = async (input) => {
        try {
            const res = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
                params: {
                    namePrefix: input,
                    limit: 10,
                    types: 'CITY',
                    sort: '-population',
                    minPopulation: 50000,
                },
                headers: {
                    'X-RapidAPI-Key': GEO_API_KEY,
                    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                }
            });

            const cities = res.data.data.map((city) => ({
                display: `${city.city}, ${city.countryCode}`,
                coords: `${city.latitude.toFixed(4)},${city.longitude.toFixed(4)}`
            }));

            setSuggestions(cities);
        } catch (err) {
            console.error('GeoDB fetch error:', err);
            setSuggestions([]);
        }
    };

    const fetchWeatherByCity = async (query) => {
        setError('');
        setNarrative('');
        setWordArray([]);
        setVisibleWordCount(0);
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/weather?city=${query}`);
            setWeather(res.data);
            setSelectedDayIndex(0);
            fetchNarrative(res.data.location, res.data.forecast.forecastday[0]);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('Failed to fetch weather. Make sure the city name or coordinates are valid.');
        }
        setLoading(false);
    };

    const fetchNarrative = async (location, dayData) => {
        setVisibleWordCount(0);
        setWordArray([]);
        try {
            const res = await axios.post('http://localhost:5000/narrative', { location, dayData });
            const newNarrative = res.data.narrative;
            setNarrative(newNarrative);
            const words = newNarrative.trim().split(/\s+/);
            setWordArray(words);

            const interval = setInterval(() => {
                setVisibleWordCount((prev) => {
                    if (prev >= words.length) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 80);
        } catch (err) {
            console.error('AI narrative fetch error:', err);
            setError('AI narrative failed.');
        }
    };

    const handleCityInputChange = async (e) => {
        const input = e.target.value;
        setCity(input);
        if (input.length >= 2) {
            await fetchSuggestions(input);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (sugg) => {
        setCity(sugg.display);
        setSuggestions([]);
        fetchWeatherByCity(sugg.coords);
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = +position.coords.latitude.toFixed(4);
                const lon = +position.coords.longitude.toFixed(4);
                const coords = `${lat},${lon}`;
                setCity('');
                setSuggestions([]);
                await fetchWeatherByCity(coords);
            },
            (error) => {
                console.error('Geolocation error:', error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('Location permission denied. Please enter a city manually.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        setError('Location request timed out.');
                        break;
                    default:
                        setError('Unable to access location. Please enter a city manually.');
                }
            }
        );
    };

    const speakNarrative = () => {
        if (!narrative) return;

        if (isSpeaking || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const cleaned = narrative.replace(/([\p{Extended_Pictographic}])/gu, '');
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
            console.error("Speech synthesis failed.");
            setIsSpeaking(false);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (weather && weather.forecast?.forecastday?.[selectedDayIndex]) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            fetchNarrative(weather.location, weather.forecast.forecastday[selectedDayIndex]);
        }
        // eslint-disable-next-line
    }, [selectedDayIndex]);

    useEffect(() => {
        if (!weather?.forecast?.forecastday?.[selectedDayIndex]) return;

        const condition = weather.forecast.forecastday[selectedDayIndex].day.condition.text.toLowerCase();
        let className = '';

        if (condition.includes('sunny')) className = 'body-sunny';
        else if (condition.includes('rain')) className = 'body-rain';
        else if (condition.includes('cloud')) className = 'body-cloudy';
        else if (condition.includes('overcast')) className = 'body-cloudy';
        else if (condition.includes('snow')) className = 'body-snow';
        else className = 'body-default';

        // Clean up previous class
        document.body.classList.remove(
            'body-sunny', 'body-rain', 'body-cloudy', 'body-snow', 'body-default'
        );

        document.body.classList.add(className);

        // Optional cleanup on unmount
        return () => {
            document.body.classList.remove(className);
        };
    }, [weather, selectedDayIndex]);

    const cToF = (celsius) => (celsius * 9 / 5 + 32).toFixed(1);
    const getDayName = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });



    return (
        <div>

            <nav className="nav">
                <h1 className="title">🌤️ Sunshine View</h1>
                <div className="controls-container">
                    <div className="search">
                        <input
                            className="search-input"
                            value={city}
                            onChange={handleCityInputChange}
                            placeholder="Enter a city"
                        />

                        {suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((sugg, idx) => (
                                    <div key={idx} onClick={() => handleSuggestionClick(sugg)} className="suggestion-item">
                                        {sugg.display}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="btn-primary" onClick={() => fetchWeatherByCity(city)}>Search</button>

                </div>

                <button className="btn-secondary" onClick={useMyLocation}>📍 Use My Location</button>

            </nav>



            <div className="header-container">



                {error && <p className="error">{error}</p>}
                {loading && <div className="spinner"></div>}


                    {weather?.location && weather?.forecast?.forecastday?.[selectedDayIndex] && (
                        <>

                        <div className="weather-box">
                            <h2>{weather.location.name}, {weather.location.country}</h2>
                            <p><strong>Local Time:</strong> {weather.location.localtime}</p>
                            <p><strong>Day:</strong> {getDayName(weather.forecast.forecastday[selectedDayIndex].date)}</p>
                            <p><strong>Condition:</strong> {weather.forecast.forecastday[selectedDayIndex].day.condition.text}</p>
                            <p><strong>Temperature:</strong> {weather.forecast.forecastday[selectedDayIndex].day.avgtemp_c}°C / {cToF(weather.forecast.forecastday[selectedDayIndex].day.avgtemp_c)}°F</p>
                            <p><strong>Humidity:</strong> {weather.forecast.forecastday[selectedDayIndex].day.avghumidity}%</p>
                            <p><strong>Max Wind:</strong> {weather.forecast.forecastday[selectedDayIndex].day.maxwind_kph} km/h</p>
                            <p>🌅 <strong>Sunrise:</strong> {weather.forecast.forecastday[selectedDayIndex].astro.sunrise} &nbsp; | &nbsp;
                                🌇 <strong>Sunset:</strong> {weather.forecast.forecastday[selectedDayIndex].astro.sunset}
                            </p>
                        </div>

                            {weather?.forecast && (
                                <div className="day-container">
                                    {weather.forecast.forecastday.map((day, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDayIndex(idx)}
                                            className={`day-button ${selectedDayIndex === idx ? 'selected' : ''}`}
                                        >
                                            {new Date(day.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}

                                                <>
                                                    <p><strong>Condition:</strong> {day.day.condition.text}</p>
                                                    <p><strong>High:</strong> {day.day.maxtemp_f}°F
                                                        <strong> Low:</strong> {day.day.mintemp_f}°F</p>
                                                    <p><strong>Humidity:</strong> {day.day.avghumidity}%</p>
                                                </>
                                        </button>
                                    ))}
                                </div>
                            )}



                        </>

                    )}


                </div>

            <div>
                {wordArray.length > 0 && (
                    <div className="narrative-container">
                        <h3><span style={{ color: '#007bff' }}>AI</span> Narrative</h3>
                        {wordArray.map((word, i) => (
                            <span
                                key={i}
                                className="narrative-word"
                                style={{
                                    animationDelay: `${i * 80}ms`,
                                    animationFillMode: i < visibleWordCount ? 'forwards' : 'none'
                                }}
                            >
                    {word}
                                {i === visibleWordCount - 1 && visibleWordCount < wordArray.length && (
                                    <span className="cursor">|</span>
                                )}
                </span>
                        ))}
                        <div>
                            <button onClick={speakNarrative} className="btn speak-btn">
                                {isSpeaking ? '🔇 Stop' : '🔊 Speak'}
                            </button>
                        </div>
            </div>

                )}
            </div>
        </div>
    );
}

export default App;