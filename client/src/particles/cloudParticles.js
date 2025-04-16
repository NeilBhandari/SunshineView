const cloudParticles = {
    fpsLimit : 30,
    particles: {
        number: { value: 5, density: { enable: true, value_area: 100 } },
        color: { value: "#ffffff" },
        shape: {
            type: "image",
            stroke: { width: 2, color: "#00ffff" },
            polygon: { nb_sides: 5 },
            image: { src: "https://i.ibb.co/vzP35N4/fluffyvloud.png", width: 100, height: 100 }
        },
        opacity: {
            value: 1,
            random: true,
            anim: {
                enable: true,
                speed: 0.1,
                opacity_min: 0.0081,
                sync: false
            }
        },
        size: {
            value: 800,
            random: false,
            anim: { enable: true, speed: 10, size_min: 2, sync: false }
        },
        line_linked: {
            enable: false,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: "left",
            random: true,
            straight: true,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: false, mode: "bubble" },
            onclick: { enable: false, mode: "push" },
            resize: true
        },
        modes: {
            grab: { distance: 400, line_linked: { opacity: 1 } },
            bubble: {
                distance: 182.71737276780266,
                size: 2,
                duration: 2,
                opacity: 8,
                speed: 2
            },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
        }
    },
    retina_detect: true
}
export default cloudParticles;


