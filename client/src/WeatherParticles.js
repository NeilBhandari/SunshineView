import React, { useEffect, useState } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";

import snowParticles from "./particles/snowParticles";
import cloudParticles from "./particles/cloudParticles";
import rainParticles from "./particles/rainParticles";
const WeatherParticles = ({ weather, selectedDayIndex }) => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        if (!weather?.forecast?.forecastday?.[selectedDayIndex]) return;

        const condition = weather.forecast.forecastday[selectedDayIndex].day.condition.text.toLowerCase();


        if (condition.includes("snow")) {
            setConfig(snowParticles);
        } else if (condition.includes("rain")) {
            setConfig(rainParticles);
        } else if (condition.includes("sunny")) {
            setConfig(null);
        } else if (condition.includes("cloud") || condition.includes("overcast")) {
            setConfig(cloudParticles);
        } else {
            setConfig(null);
        }
    }, [weather, selectedDayIndex]);

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };



    return (
        <div className="particles">
            {config && (
                <Particles
                    id="weather-particles"
                    init={particlesInit}
                    options={config}
                />
            )}
        </div>
    );


};

export default React.memo(WeatherParticles);