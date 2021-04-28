let rotation_speed = 1, //degree per frame
    initial_angle = 0, // initial rotation angle
    velocity = 0,
    ball_restitution = 0, //bounciness of the ball
    radius = 350,
    object_radius = 5,
    launch_angle = 0,
    ball_x = window.innerWidth / 2,
    ball_y = window.innerHeight / 2 + radius,
    outter_circle_color = "black";


let recorder, stream;
let Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Events = Matter.Events,
    Body = Matter.Body,
    Vector = Matter.Vector,
    engine = Engine.create();

var canvas = document.getElementById("world"),
    objects = [],
    trail = [];

engine.world.gravity.y = 0;

let ball = Bodies.circle(
    ball_x,
    ball_y,
    object_radius, {
        frictionAir: 0,
        friction: Infinity,
        frictionStatic: 0,
        inertia: Infinity,
        restitution: ball_restitution,
    }
);
//ball object in center of screen

let rotating_circle = containerPolygon(
    window.innerWidth / 2,
    window.innerHeight / 2,
    1000,
    radius + object_radius,
    outter_circle_color
);
//hollow circle

var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "rgb(255, 255, 255)"
    },
});

objects.push(ball, rotating_circle);
// adding objects to array

World.add(engine.world, objects);
// World.add(engine.world, mouseConstraint);	
//add objects to the world

Engine.run(engine);
Render.run(render);

function containerPolygon(
    x, y, sides, radius, color
) {
    const width = 2;
    const extraLength = 1.15;
    const initialRotation = 0;
    const theta = (2 * Math.PI) / sides;
    const sideLength = ((2 * radius * theta) / 2) * extraLength;
    const parts = [];

    for (let i = 0; i < sides; i++) {
        // We'll build thin sides and then translate + rotate them appropriately.
        const body = Bodies.rectangle(0, 0, sideLength, width, {
            render: {
                fillStyle: color,
            },

        });
        Body.rotate(body, i * theta);
        Body.translate(body, {
            x: radius * Math.sin(i * theta),
            y: -radius * Math.cos(i * theta),
        });
        parts.push(body);
    }

    const ret = Body.create({
        isStatic: true,
        frictionAir: 0,
        friction: Infinity,
        frictionStatic: 0,
        inertia: Infinity, // setting inertia to infinty will prevent rotation upon collision
        rotationSpeed: 1,
        restitution: ball_restitution,
    });

    Body.setParts(ret, parts);
    Body.translate(ret, { x: x, y: y });
    return ret;
}
//multi-polygon to create hollow circle

Events.on(render, "afterRender", function() {
    trail.unshift({
        position: Vector.clone(ball.position),
        speed: ball.speed,
    });

    Render.startViewTransform(render);
    render.context.globalAlpha = 0.7;

    for (var i = 0; i < trail.length; i += 1) {
        var point = trail[i].position;
        // render.context.fillStyle = "red";
        // render.context.fillRect(point.x, point.y, 2, 2);
    }

    render.context.globalAlpha = 1;
    Render.endViewTransform(render);

    //  if (trail.length > 2000) {
    //    trail.pop();
    //  }
});
//trace the path of the ball

// function updateRotation() {
//   Matter.Body.setAngle(
//     rotating_circle,
//     rotating_circle.angle + rotating_circle.rotationSpeed
//   );

//   requestAnimationFrame(updateRotation);
// }
// window.requestAnimationFrame(updateRotation);
//rotate hollow circle

var touchedPeri;

function rotate() {
    if (document.getElementById("degree").value == "") {
        alert("rotation value not filled");
    } else {
        console.log(ball.velocity);
        if (
          ball.velocity.x > velocity * x_component - 0.0001
        ) {
          rotation_speed = parseFloat(document.getElementById("degree").value);
          initial_angle += rotation_speed;
          canvas.style.transform = "rotate(" + initial_angle + "deg)";
          //console.log(ball.position);
          console.log(ball.velocity);
          requestAnimationFrame(rotate);
        }
    }
}

function dRotate(){
    if (document.getElementById("degree").value == "") {
        alert("rotation value not filled");
    } else {

        rotation_speed = parseFloat(document.getElementById("degree").value);
        initial_angle += rotation_speed;
        canvas.style.transform = "rotate(" + initial_angle + "deg)";
        //console.log(ball.position);
        console.log(ball.velocity);
        requestAnimationFrame(dRotate);
    
    }

}

function force() {
    if (
        document.getElementById("velocity").value == "" ||
        document.getElementById("launch").value == ""
    ) {
        alert("velocity not filled");
    } else {

        // x_force = parseFloat(document.getElementById("xf").value);
        // y_force = parseFloat(document.getElementById("yf").value);
        launch_angle = parseFloat(document.getElementById("launch").value);
        velocity = parseFloat(document.getElementById("velocity").value);

        launch_angle = launch_angle * (Math.PI / 180);
        
        x_component = Math.cos(launch_angle);
        y_component = Math.sin(launch_angle);


        Body.setVelocity(ball, { x: x_component * velocity, y: -y_component * velocity });


        

    }
}

async function force_rotate() {
    await force();
    await rotate();
}

async function startRecording() {
    stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
    });
    recorder = new MediaRecorder(stream);

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = (e) => {
        const completeBlob = new Blob(chunks, { type: chunks[0].type });
        setVideo(completeBlob);
    };

    recorder.start();
}

function start() {
    startRecording();
}

function stop() {
    recorder.stop();
    stream.getVideoTracks()[0].stop();
}

function setVideo(blob) {
    var url = URL.createObjectURL(blob);
    download(url);
}

function download(blob_url) {
    var fileName = "video.mp4";
    var a = document.createElement("a");
    a.href = blob_url;
    a.download = fileName;
    a.textContent = "DOWNLOAD " + fileName;

    document.getElementById("download").appendChild(a);
    a.click();
}

function display(vid) {
    var video = document.getElementById("video");
    video.src = window.URL.createObjectURL(vid);
}
