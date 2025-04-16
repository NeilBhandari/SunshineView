const rainParticles = {
        fpsLimit: 30,
        interactivity: {
            detectsOn: "canvas",
            events: {
                onClick: {
                    enable: false,
                    mode: "repulse"
                },
                onDiv: {
                    elementId: "repulse-div",
                    enable: false,
                    mode: "repulse"
                },
                onHover: {
                    enable: false,
                    mode: "repulse",
                    parallax: {
                        enable: false,
                        force: 60,
                        smooth: 10
                    }
                },
                resize: true
            },
            modes: {
                bubble: {
                    distance: 400,
                    duration: 2,
                    opacity: 0.8,
                    size: 40,
                    speed: 3
                },
                connect: {
                    distance: 80,
                    lineLinked: {
                        opacity: 0.5
                    },
                    radius: 60
                },
                grab: {
                    distance: 400,
                    lineLinked: {
                        opacity: 1
                    }
                },
                push: {
                    quantity: 4
                },
                remove: {
                    quantity: 2
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                }
            }
        },
        particles: {
            color: {
                value: "#00FFFF"
            },
            lineLinked: {
                blink: false,
                color: "#000",
                consent: false,
                distance: 150,
                enable: false,
                opacity: 0,
                width: 0
            },
            rotate: {
                value: 0,
                random: false,
                direction: "clockwise",
                animation: {
                    enable: false,
                    speed: 5,
                    sync: false
                }
            },
            move: {
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                },
                bounce: false,
                direction: "bottom",
                enable: true,
                outMode: "out",
                random: {
                    enable:true,
                    minimumValue:50,
                },
                speed: 80,
                straight: true
            },
            number: {
                density: {
                    enable: true,
                    area: 800
                },
                limit: 0,
                value: 200
            },
            opacity: {
                animation: {
                    enable: false,
                    minimumValue: 0.1,
                    speed: 1,
                    sync: false
                },
                random: false,
                value: 0.5
            },
            shape: {
                character: {
                    fill: false,
                    font: "Verdana",
                    style: "",
                    value: "*",
                    weight: "400"
                },
                image: [],
                polygon: {
                    nb_sides: 5
                },
                stroke: {
                    color: "#efefefee",
                    width: 0.5
                },
                type: "circle"
            },
            size: {
                animation: {
                    enable: true,
                    minimumValue: 5,
                    maximumValue: 15,
                    speed: 0,
                    sync: false
                },
                random: true,
            }
        },
        polygon: {
            draw: {
                enable: false,
                lineColor: "#ffffff",
                lineWidth: 0.5
            },
            move: {
                radius: 10
            },
            scale: 1,
            type: "none",
            url: ""
        },
    detectRetina: true,
    };


export default rainParticles;