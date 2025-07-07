import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import bgImg from '../assets/bgImg.png'
import sceneModel from '../assets/Umi.glb'
import umiShader from '../glsl/umiModel';
import backgroundShader from '../glsl/background';
import gsap from "gsap"




export default class App {
    constructor({dom}){
        this.dom = dom;
        this.section = "index"
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock()
        this.textureLoader = new THREE.TextureLoader();
       
        this.camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.01, 
          100000
        );
    
        this.camera.position.z = 25;
        this.camera.position.y = 3.35;
        this.camera.position.x = -0.75;

       

        this.container = new THREE.Object3D()
        this.scene.add(this.container)

    

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.dom,
          antialias: true
        });
    
        // this.renderer.gammaInput = true;
        // this.renderer.gammaOutput = true; 
        this.renderer.setSize(innerWidth, innerHeight);

        this.cube = null
        this.model = null
        this.cloth = null
        this.piano = null
        this.backgroundMesh = null

        this.canTransitionAnimated = true;
        this.canBackgroundAnimated = {
            value: true,
            time: 0
        };
        this.transitionTimeline = new gsap.timeline({paused: true})

        this.spotLight = new THREE.Object3D();
        // this.scene.add(this.spotLight)
        this.texts = new THREE.Object3D()
        this.scene.add(this.texts)

        this.world = new THREE.Object3D();
        this.scene.add(this.world)
        this.umiGroup = new THREE.Object3D();
        this.world.add(this.umiGroup)
        this.brickGroup = new THREE.Object3D()
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.backgroundMaterial = new THREE.ShaderMaterial({
            vertexShader: backgroundShader.vertex,
            fragmentShader: backgroundShader.fragment,
            uniforms: {
                uTxt1: { type: "sample2D", value: this.textureLoader.load(bgImg) },
                uOffset : { type: 'float', value:   0.8 },
                uProgress: { type: 'float', value: 0. },
                uTime: {type: 'float', value: 0.}
            },          
            side: THREE.DoubleSide
        })

        this.objects = {
            objectNames: ["umi", "cloth", "ctrlButtons", "ctrlButton", "cButton", "piano", "vButton", "ctrlNotes", "cNotes", "vNotes", "controlBrick", "cBrick", "vBrick", "background"],
            objectVal: {
                lights: []
            }
        }
      
       
        this.keyElements = {
            "Control": {
                element: null,
                active: false,
                noteActive: false,
                noteElement: null,
                noteColor: "#f522c4",
                brickElement: null
            },
            "c":  {
                element: null,
                active: false,
                noteActive: false,
                noteElement: null,
                noteColor: "#001aff",
                brickElement: null
            },
            "v": {
                element: null,
                active: false,
                noteActive: false,
                noteElement: null,
                noteColor: "#00ffea",
                brickElement: null
            }
        }
        this.onResize();
    }
    
    async init(){
        this.addLights()
        await this.initStage(() => this.callAfterInit())
        
        this.addEvents()
    }
    callAfterInit(){
        this.addButtonPressed()
    }
   
    scollTo(sectionName) {
        const rotated = {
            "index" : { // name face
                y: -5,
                i: 0
            },
            "about" : { // room + picture
                y: -2.5,
                i: 1

            },
            "exp" : { // water side
                y:  -0,
                i: 2

            },
            "contact": { // screen face
                y: 2.5 ,
                i: 3

            },
            "end": { // lavar
                y: 5,
                i: 4

            },
            
        }
        let onStart = () => {
            this.canTransitionAnimated = false
            this.canBackgroundAnimated.value = false
            this.canBackgroundAnimated.time = Math.PI 
        }
        let onComplete = () => {
            this.section = sectionName
            this.canTransitionAnimated = true
            this.canBackgroundAnimated.value = true
           
            // let campos = calcCamPos(rotated[sectionName].corner)
            // console.log("campos: ", campos)
            // console.log("lookAt: ", this.objects.objectVal[rotated[sectionName].corner].position)
            // this.camera.lookAt(...calcTranslate(sectionName).clone().multiplyScalar(2))
            // console.log("look: ", ...calcTranslate(sectionName).clone())
        }
        
        if(sectionName !== this.section  ) {
            if(!this.canTransitionAnimated) {
                this.transitionTimeline.kill()
            } 
            
            this.transitionTimeline = new gsap.timeline({onComplete: () => onComplete(), onStart: () => onStart()})
            this.transitionTimeline.to(this.world.position, {z: -25, duration: 0.5, ease: "sine"})
            this.transitionTimeline.to(this.backgroundMaterial.uniforms.uProgress, {value: 1., duration: 0.85, ease: "sine"})
            
            this.transitionTimeline.to(this.umiGroup.position, {y: rotated[sectionName].y, duration: 0.25, ease: "sine"})
            this.transitionTimeline.to(this.brickGroup.rotation, {y: `${rotated[sectionName].i *  Math.PI}`, duration: 0.5, ease: "sine"}, "-=0.5")
            this.transitionTimeline.to(this.backgroundMaterial.uniforms.uOffset, {value:  0.8 - 0.2 * (rotated[sectionName].i    ), duration: 0.5, ease: "sine"}, "-=0.5")
            this.transitionTimeline.to(this.world.position, {z: -10, x: `${10 * ((rotated[sectionName].i ) % 2 - 0.5) * 2}`, duration: 0.5, ease: "sine"})
        }

    }
    checkkey(obj, testkey) {
        return Object.keys(obj).some(key => key === testkey)
    }
    addButtonPressed(){
        window.addEventListener("keydown", ev => {
            if(!this.checkkey(this.keyElements, ev.key) || !this.keyElements[ev.key].element) return;

            if( !this.keyElements[ev.key].active){
                this.keyElements[ev.key].active = true
                gsap.to(this.keyElements[ev.key].element.scale, {y: 0.3, duration: 0.2})
                gsap.to(this.piano.position, {y: -0.5, duration: 0.2, onComplete: () => {
                    this.keyElements[ev.key].noteActive = !this.keyElements[ev.key].noteActive
                    this.keyElements[ev.key].noteElement.material.color = new THREE.Color(this.keyElements[ev.key].noteActive ? this.keyElements[ev.key].noteColor : "white")
                    
            }})
                
            
        }})
         window.addEventListener("keyup", ev => {
             if(!this.checkkey(this.keyElements, ev.key) || !this.keyElements[ev.key].element) return;
             
             // console.log("key no check", ev)
             if( this.keyElements[ev.key].active){
                
                this.keyElements[ev.key].active = false
                gsap.to(this.keyElements[ev.key].element.scale, {y: 1,  duration: 0.2})
                gsap.to(this.piano.position, {y: 0.5, duration: 0.2, onComplete:() => {
                    if(!this.keyElements[ev.key].brickElement) return;
                    let isActive = this.keyElements[ev.key].noteActive
                    let cloneClothColor = {...this.cloth.children[0].material.color}

                    let tl = new gsap.timeline()
                    tl.to(this.keyElements[ev.key].brickElement.position, { y: 0.5, duration: 0.2, ease: "sine"})
                    tl.to(this.keyElements[ev.key].brickElement.position, { y: -.5, duration: 0.4})
                    tl.to(this.keyElements[ev.key].brickElement.position, { y: 0, duration: 0.2, ease: "sine"})

                    tl.to(this.cloth.children[1].material.color, {
                        r: isActive ? (new THREE.Color(this.keyElements[ev.key].noteColor).r * 0.2) : cloneClothColor.r,
                        g: isActive ? (new THREE.Color(this.keyElements[ev.key].noteColor).g * 0.2) : cloneClothColor.g,
                        b: isActive ? (new THREE.Color(this.keyElements[ev.key].noteColor).b * 0.2) : cloneClothColor.b,
                        duration: 0.2
                    }, "-=0.6")   
                }})



            }
        })
    }
    addLights(){
        this.ambient = new THREE.AmbientLight({color: 0x757575, intensity: 0.25 })
        this.world.add(this.ambient)
        var lights = [];
        lights[0] = new THREE.DirectionalLight( 0xffffff, .55 );
        lights[0].position.set( 10, 0, 0 );

        lights[1] = new THREE.DirectionalLight( 0x11E8BB, .5 );
        lights[1].position.set( 4.75, 8, 0.5 );
       
        lights[2] = new THREE.DirectionalLight( 0x8200C9, .5 );
        lights[2].position.set( -12.75, -1, 0.5 );
        lights[3] = new THREE.DirectionalLight( 0xffffff, .5 );
        lights[3].position.set( 5, 3, -8 );
        this.scene.add( lights[0] );
        this.scene.add( lights[1] );
        this.scene.add( lights[2] );
        this.scene.add( lights[3] );
    }
    async initStage(cb){
        function capitalizeFirstLetter(val) {
            return String(val).charAt(0).toUpperCase() + String(val).slice(1);
        }
        await new GLTFLoader().load(sceneModel, gltf => {
            this.cube = gltf.scene
            gltf.scene.traverse(  object =>  {
                // console.log("gltf: ", String(object.userData.name))
                let obj = this.objects.objectNames.find(o => capitalizeFirstLetter(o) == object.userData.name)
                if(obj) {
                    this.objects.objectVal[obj] = object
                } 
               
            });
            this.model = this.objects.objectVal.umi;
            this.umiGroup.add(this.model)
            this.cloth = this.objects.objectVal.cloth;
 
            this.model.material = new THREE.ShaderMaterial({
                vertexShader:  umiShader.vertex,
                fragmentShader: umiShader.fragment,
                uniforms: {
                    uTime: { type: 'float', value: 0.0 }
                },
                side: THREE.DoubleSide
            })
       
            this.ctrlButtons = this.objects.objectVal.ctrlButtons
            
            this.world.add(this.ctrlButtons)
            this.piano = this.objects.objectVal.piano
            // this.objects.objectVal.ctrlButton.material.color = new THREE.Color(this.keyElements["Control"].noteColor)

            this.keyElements["Control"].element = this.objects.objectVal.ctrlButton
            // this.objects.objectVal.cButton.material.color = new THREE.Color(this.keyElements["c"].noteColor)
            this.keyElements["c"].element = this.objects.objectVal.cButton
            // this.objects.objectVal.vButton.material.color = new THREE.Color(this.keyElements["v"].noteColor)
            
            this.keyElements["v"].element = this.objects.objectVal.vButton

            this.keyElements["Control"].noteElement = this.objects.objectVal.ctrlNotes
            this.keyElements["c"].noteElement = this.objects.objectVal.cNotes
            this.keyElements["v"].noteElement = this.objects.objectVal.vNotes

            this.keyElements["Control"].brickElement = this.objects.objectVal.controlBrick
            this.brickGroup.add(this.keyElements["Control"].brickElement)

            this.keyElements["c"].brickElement = this.objects.objectVal.cBrick
            this.brickGroup.add(this.keyElements["c"].brickElement)

            this.keyElements["v"].brickElement = this.objects.objectVal.vBrick
            this.brickGroup.add(this.keyElements["v"].brickElement)

            this.world.add(this.brickGroup)
            
            this.backgroundMesh = this.objects.objectVal.background
            this.backgroundMesh.material = this.backgroundMaterial
            this.world.add(this.backgroundMesh)

            this.world.position.x = -10
            this.world.position.z = -10

            this.world.scale.set(4., 4., 4.)
            
            this.umiGroup.position.y = -5

            cb()
        })

        
    }
    
    addEvents() {
        window.requestAnimationFrame(this.run.bind(this));
        window.addEventListener("resize", this.onResize.bind(this), false);
    }
    
    run() {
        requestAnimationFrame(this.run.bind(this));
        this.render();
    }
    easeInOutQuint(x) {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
    }
   
    render() {
        let time = this.clock.getElapsedTime()
        // console.log("time: ", time, " delta: ", delta)
        if(this.model) {
            this.model.material.uniforms.uTime.value = time / 16.
            this.model.rotation.y += 0.005
        }
        if(this.canBackgroundAnimated.value) {
            this.canBackgroundAnimated.time += 0.01
            this.backgroundMaterial.uniforms.uProgress.value = Math.pow(Math.sin(this.canBackgroundAnimated.time / 2), 2)
        } 
        if(this.backgroundMaterial) {
            this.backgroundMaterial.uniforms.uTime.value = time / 16.
        }
        this.spotLight.rotation.y -= 0.01
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        const w = innerWidth;
        const h = innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}