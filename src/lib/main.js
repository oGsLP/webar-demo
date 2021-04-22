import * as handTrack from './handtrack.js'
import {
    Scene, Group, Mesh, Vector3, Object3D,
    PerspectiveCamera, OrthographicCamera,
    AmbientLight, SpotLight, PointLight,
    WebGLRenderer,
    MeshPhongMaterial, MeshBasicMaterial, MeshLambertMaterial
} from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import virus_model from '../objs/virus.gltf'
import {dumpInTree, dumpObject} from './logTool.js'

// 检查设备类型
function checkIfMobile() {
    // let isPC = navigator.platform.indexOf("Win") == 0 ||
    //     navigator.platform.indexOf("Mac") == 0 ||
    //     navigator.platform.indexOf("X11") == 0 ||
    //     navigator.platform.indexOf("Linux") == 0;
    // let isPad = navigator.userAgent.match(/iPad/i) != null;
    //
    // return !(isPC || isPad);
    return !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)
}

const uniWidth = window.innerWidth;
const uniHeight = window.innerHeight;
const centerX = uniWidth / 2;
const centerY = uniHeight / 2;
let unit = 100;

const isWideDevice = window.innerWidth > window.innerHeight; // 是否是宽屏设备(width>height)
const useBackCamera = checkIfMobile(); // 是否使用后置摄像头
const flipHorizontal = !useBackCamera; // 前置摄像头时需水平翻转画面
const ratio = isWideDevice ? 0.85 : 1; // 暂时设置的比例


const video = document.querySelector("#ar-video")

// 若是前置摄像头，反转video画面
if (flipHorizontal) {
    video.setAttribute("style",
        "-moz-transform:scaleX(-1);-webkit-transform:scaleX(-1);" +
        "-o-transform:scaleX(-1);transform:scaleX(-1);");
}
// video.setAttribute("style", `width:${uniWidth};height:${uniHeight}`)
video.width = uniWidth;
video.height = uniHeight;
//video.style.display = 'none'; // 是否展示video

// 加载 handtrack.js 模型
let model = null;
const modelParams = {
    flipHorizontal: flipHorizontal,   // flip e.g for video
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.75,    // confidence threshold for predictions.
} //模型参数

handTrack.load(modelParams).then(lm => {
    model = lm
}); // 模型加载

const objLoader = new OBJLoader();
const loader = new GLTFLoader();

// const video = document.createElement("video");
// video.setAttribute("style", "display:none");
// video.setAttribute("id", "ar-video")
// document.body.appendChild(video);


//////////////////////////////////////////////////////////////////////////////
//	设置video取图像的比例大小，区分宽屏窄屏
//////////////////////////////////////////////////////////////////////////////


let videoParameters = {
    facingMode: useBackCamera ? {exact: "environment"} : "user"
}

if (isWideDevice) {
    videoParameters.width = Math.floor(window.innerWidth * ratio);
    videoParameters.height = Math.floor(window.innerHeight * ratio);
} else {
    videoParameters.width = Math.floor(window.innerHeight * ratio);
    videoParameters.height = Math.floor(window.innerWidth * ratio);
}

//////////////////////////////////////////////////////////////////////////////
//	设置处理 video stream
//////////////////////////////////////////////////////////////////////////////
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
        video: videoParameters
    }
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream;
        video.play();
    })
        .catch(e => {
            alert(`Webcam error: ${e}`);
        });
} else {
    alert('sorry - media devices API not supported');
}


//////////////////////////////////////////////////////////////////////////////
//	建立 three.scene
//////////////////////////////////////////////////////////////////////////////
let scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10)
camera.lookAt(scene.position)


const ambientLight = new AmbientLight(0x0c0c0c, 1);
// const spotLight = new SpotLight()
const pointLight = new PointLight(0xFFFFF, 1.2)
pointLight.position.set(10, 10, 10)
// scene.add(ambientLight);
scene.add(pointLight)
// scene.add(spotLight);

const renderer = new WebGLRenderer({alpha: true});
// todo: canvas 设置
// renderer.setClearAlpha(0)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


camera.position.z = 5;


let isVideo = false;

let canvas = document.getElementById("ar-canvas")
let context = canvas.getContext("2d");
context.fillStyle = 'rgba(255, 255, 255, 0)';

unit = getCoordinateUnit()
startVideo()


function startVideo() {
    handTrack.startVideo(video, useBackCamera).then(function (status) {
        console.log("video started", status);
        if (status) {
            isVideo = true
            runDetection()
        }
    });
}

// todo: monitor fps and render delay

// let stats_0 = new Stats();
// stats_0.setMode(0); // 0: fps, 1: ms
// stats_0.domElement.style.position = 'absolute';
// stats_0.domElement.style.left = '0px';
// stats_0.domElement.style.top = '0px';
// document.body.appendChild( stats_0.domElement );
//
// let stats_1 = new Stats();
// stats_1.setMode(1); // 0: fps, 1: ms
// stats_1.domElement.style.position = 'absolute';
// stats_1.domElement.style.left = '100px';
// stats_1.domElement.style.top = '0px';
// document.body.appendChild( stats_1.domElement );


// setInterval( function () {
//     stats.begin();
//     // 你的每一帧的代码
//     stats.end();
// }, 1000 / 60 );

let virus = null;
let virusGroup = null;
let virusNum = 0;

loadModels()

let frame = 0;
let unrecognized = 0;
let recognized = 0;
let on = true;

// todo: time参数
function runDetection() {

    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video);
        if (predictions.length > 0) {
            if (virusNum === 0 && on === true) {
                virusNum = randomNum(6, 9)
                console.log(virusNum)
                generateVirusArray(virusNum)
            }
            virusGroup.visible = true;
            unrecognized = 0;
            for (let i = 0; i < predictions.length; i++) {
                let arr = virusGroup.children;

                for (let j = 0; j < virusNum; j++) {
                    let v = arr[j];
                    let sym = j % 2 === 0 ? -1 : 1
                    v.rotation.x += 0.01 * sym;
                    v.rotation.y += 0.01 * sym;
                    v.rotation.z += 0.01 * sym;
                }
                if (frame < 10) {
                    let x = predictions[i]["bbox"][0] + predictions[i]["bbox"][2] / 2
                    let y = predictions[i]["bbox"][1] + predictions[i]["bbox"][3] / 2
                    justifyVirusArray(positionToCoordinate(x, y))
                }
                frame++;
            }
            recognized++;
            if (recognized > 15 && virusNum > 0) {

                virusGroup.remove(virusGroup.children[virusNum - 1])
                virusNum--;

                if (virusNum === 0) {
                    on = false
                }

                recognized -= 8
            }
            renderer.render(scene, camera);
        } else {
            recognized = 0;
            unrecognized++;
            if (unrecognized > 10 && virusNum !== 0) {
                virusGroup.visible = false
                renderer.render(scene, camera);
            }
        }
        if (isVideo) {
            requestAnimationFrame(runDetection);
            // stats_0.update()
            // stats_1.update()
            // todo: tween.js for animation
        }
    });
}

function render(delay) {

}

// todo: 响应式
// camera.aspect = canvas.clientWidth / canvas.clientHeight;
// camera.updateProjectionMatrix();

function loadModels() {
    loadVirusModel();
}

function vectorToString(vector) {
    return `${vector.x} ${vector.y} ${vector.z}`;
}


console.log(objLoader)

function loadVirusModel() {
    // loader.setPath("./objs/");
    loader.load(
        virus_model,
        function (object) {
            virus = object["scene"]["children"][0]
            // todo: modify material and texture
            virus.material = new MeshLambertMaterial({color: 0x157441})
            dumpInTree(virus)
            virus.visible = false
        }
    );

}

function generateVirusArray(num) {
    virusGroup = new Group();
    virusGroup.scale.set(0.02, 0.02, 0.02);

    for (let i = 0; i < num; i++) {
        let v = virus.clone();
        v.visible = true;

        let scale = randomNum(2, 6) / 10
        v.scale.set(scale, scale, scale)
        let x = randomNum(0, 10) > 5 ? -1 : 1 * randomNum(15, 25) * (i % 7)
        let y = randomNum(0, 10) > 5 ? -1 : 1 * randomNum(15, 25) * (i % 7)
        v.position.set(x, y, 0)
        virusGroup.add(v);
    }
    scene.add(virusGroup);
}

function justifyVirusArray(pair) {
    virusGroup.position.x = pair.x;
    virusGroup.position.y = pair.y;
}


function getCoordinateUnit() {

    // todo: 设置正交camera，使像素对应坐标

    let cube = new Mesh();
    cube.position.x = 1;
    cube.position.y = 0;
    cube.visible = false;
    scene.add(cube);
    renderer.render(scene, camera);

    let vector = new Vector3();

    cube.updateMatrixWorld();
    vector.setFromMatrixPosition(cube.matrixWorld);
    vector.project(camera);

    scene.remove(cube)
    renderer.render(scene, camera);

    return vector.x * centerX
}


function positionToCoordinate(x, y) {
    let vector = new Vector3();
    vector.x = (x - centerX) / unit;
    vector.y = (centerY - y) / unit;
    vector.z = 0;
    return vector;
}

function coordinateToPosition(vector) {
    return {
        x: vector.x * centerX + centerX,
        y: centerY - vector.y * centerY
    }
}

function randomNum(minNum, maxNum) {
    if (arguments.length === 1) {
        return parseInt(Math.random() * minNum + 1, 10);
    } else if (arguments.length === 2) {
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    } else {
        return 0;
    }
}



