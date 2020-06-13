"use strict";
console.clear();
var Stage = (function() {
    function Stage(name, backgroundColor, transparent) {

        var _this = this;
        if (backgroundColor === void 0) {
            backgroundColor = '#000000';
        }
        if (transparent === void 0) {
            transparent = true;
        }
        this.render = function() {
            _this.renderer.render(_this.scene, _this.camera);
        };
        this.add = function(elem) {
            _this.scene.add(elem);
        };
        this.remove = function(elem) {
            _this.scene.remove(elem);
        };
        this.onResize = function() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            _this.camera.aspect = w / h;
            var camZ = (screen.width - (w * 1)) / 3;
            _this.camera.position.z = camZ < 180 ? 180 : camZ;
            _this.camera.updateProjectionMatrix();
            _this.renderer.setSize(w, h);
            _this.render();
        };
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.classList.add(name);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 180;
        this.camera.lookAt(new THREE.Vector3(0, 5, 0));

        this.pointLight = new THREE.PointLight(0xffffff, 0.75);
        this.pointLight.position.z = 150;
        this.pointLight.position.x = 70;
        this.pointLight.position.y = -20;
        this.scene.add(this.pointLight);
        this.softLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(this.softLight);

        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.onResize();
        window.addEventListener('resize', this.onResize, false);
    }
    return Stage;
}());
var App = (function() {
    function App(plane, wireframe) {
        if (wireframe === void 0) {
            wireframe = false;
        }
        this.tick = function() {
            this.stage.render();
        };
        this.light = function() {
            return this.stage.pointLight;
        };
        this.stage = new Stage(wireframe ? 'wireframe' : 'solid', wireframe ? '#000000' : '#D0CBC7', !wireframe);
        if (wireframe) {
            var edges = new THREE.EdgesGeometry(plane.children[0].geometry);
            var line = new THREE.LineSegments(edges);
            line.material.depthTest = false;
            line.material.opacity = 0.5;
            line.material.transparent = true;
            line.position.x = 0.5;
            line.position.z = -1;
            line.position.y = 0.2;
            this.model = line;
        } else {
            this.model = plane;
        }
        this.stage.add(this.model);
    }
    return App;
}());

function init() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(DrawSVGPlugin);
    gsap.set('#line-length', {
        drawSVG: 0
    });
    gsap.set('#line-wingspan', {
        drawSVG: 0
    });
    gsap.set('#circle-phalange', {
        drawSVG: 0
    });
    var object;
    var line;

    function loadModel() {
        object.traverse(function(child) {
            var mat = new THREE.MeshPhongMaterial({
                color: 0x171511,
                specular: 0xD0CBC7,
                shininess: 5,
                flatShading: true
            });
            child.material = mat;
        });
        start(object);
    }
    var manager = new THREE.LoadingManager(loadModel);
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };

    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
        }
    }

    function onError() {}
    var loader = new THREE.OBJLoader(manager);
    loader.load('data/airplane.obj', function(obj) {
        object = obj;
    }, onProgress, onError);
}
init();

function start(model) {
    var solidPlane = new App(model, false);
    var wireframePlane = new App(model, true);
    gsap.fromTo('canvas', {
        x: "50%",
        autoAlpha: 0
    }, {
        duration: 1,
        x: "0%",
        autoAlpha: 1
    });
    gsap.to('.loading', {
        autoAlpha: 0
    });
    gsap.to('.scroll-cta', {
        opacity: 1
    });
    gsap.set('svg', {
        autoAlpha: 1
    });
    var planes = [solidPlane.model, wireframePlane.model];
    var tau = Math.PI * 2;
    gsap.set(planes.map(function(p) {
        return p.rotation;
    }), {
        y: tau * -.25
    });
    gsap.set(planes.map(function(p) {
        return p.position;
    }), {
        x: 80,
        y: -32,
        z: -60
    });
    var sectionDuration = 1;
    gsap.to('.ground', {
        y: "30%",
        scrollTrigger: {
            trigger: ".ground-container",
            scrub: true,
            start: "top bottom",
            end: "bottom top"
        }
    });
    gsap.from('.clouds', {
        y: "25%",
        scrollTrigger: {
            trigger: ".ground-container",
            scrub: true,
            start: "top bottom",
            end: "bottom top"
        }
    });
    gsap.to('#line-length', {
        drawSVG: 100,
        scrollTrigger: {
            trigger: ".length",
            scrub: true,
            start: "top bottom",
            end: "top top"
        }
    });
    gsap.to('#line-wingspan', {
        drawSVG: 100,
        scrollTrigger: {
            trigger: ".wingspan",
            scrub: true,
            start: "top 25%",
            end: "bottom 50%"
        }
    });
    gsap.to('#circle-phalange', {
        drawSVG: 100,
        scrollTrigger: {
            trigger: ".phalange",
            scrub: true,
            start: "top 50%",
            end: "bottom 100%"
        }
    });
    gsap.to('#line-length', {
        opacity: 0,
        drawSVG: 0,
        scrollTrigger: {
            trigger: ".length",
            scrub: true,
            start: "top top",
            end: "bottom top"
        }
    });
    gsap.to('#line-wingspan', {
        opacity: 0,
        drawSVG: 0,
        scrollTrigger: {
            trigger: ".wingspan",
            scrub: true,
            start: "top top",
            end: "bottom top"
        }
    });
    gsap.to('#circle-phalange', {
        opacity: 0,
        drawSVG: 0,
        scrollTrigger: {
            trigger: ".phalange",
            scrub: true,
            start: "top top",
            end: "bottom top"
        }
    });
    var tl = new gsap.timeline({
        onUpdate: function() {
            solidPlane.tick();
            wireframePlane.tick();
        },
        scrollTrigger: {
            trigger: ".content",
            scrub: true,
            start: "top top",
            end: "bottom bottom"
        },
        defaults: {
            duration: sectionDuration,
            ease: 'power2.inOut'
        }
    });
    var delay = 0;
    tl.to('.scroll-cta', {
        duration: 0.25,
        opacity: 0
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        x: -10,
        ease: 'power1.in'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * .25,
        y: 0,
        z: -tau * 0.05,
        ease: 'power1.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        x: -40,
        y: 0,
        z: -60,
        ease: 'power1.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * .25,
        y: 0,
        z: tau * 0.05,
        ease: 'power3.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        x: 40,
        y: 0,
        z: -60,
        ease: 'power2.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * .2,
        y: 0,
        z: -tau * 0.1,
        ease: 'power3.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        x: -40,
        y: 0,
        z: -30,
        ease: 'power2.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: 0,
        z: 0,
        y: tau * .25
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        x: 0,
        y: -10,
        z: 50
    }, delay);
    tl.to('.wireframe', {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)',
        ease: 'none'
    }, delay);
    tl.to('.solid', {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0% 0%)',
        ease: 'none'
    }, delay);
    delay += sectionDuration;
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * 0.25,
        y: tau * .5,
        z: 0,
        ease: 'power4.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        z: 30,
        ease: 'power4.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * 0.25,
        y: tau * .5,
        z: 0,
        ease: 'power4.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        z: 60,
        x: 30,
        ease: 'power4.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * 0.35,
        y: tau * .75,
        z: tau * 0.6,
        ease: 'power4.inOut'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        z: 100,
        x: 20,
        y: 0,
        ease: 'power4.inOut'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        x: tau * 0.15,
        y: tau * .85,
        z: -tau * 0,
        ease: 'power1.in'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        z: -150,
        x: 0,
        y: 0,
        ease: 'power1.inOut'
    }, delay);
    tl.set('.solid', {
        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)',
        ease: 'none'
    }, delay);
    tl.to('.solid', {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)',
        ease: 'none'
    }, delay);
    tl.to('.wireframe', {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0% 0%)',
        ease: 'none'
    }, delay);
    delay += sectionDuration;
    tl.to(planes.map(function(p) {
        return p.rotation;
    }), {
        duration: sectionDuration,
        x: -tau * 0.05,
        y: tau,
        z: -tau * 0.1,
        ease: 'none'
    }, delay);
    tl.to(planes.map(function(p) {
        return p.position;
    }), {
        duration: sectionDuration,
        x: 0,
        y: 30,
        z: 320,
        ease: 'power1.in'
    }, delay);
    tl.to(solidPlane.light().position, {
        duration: sectionDuration,
        x: 0,
        y: 0,
        z: 0
    }, delay);
}