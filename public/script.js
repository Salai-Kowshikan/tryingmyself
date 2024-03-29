const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      console.log("call received");
      call.answer(stream);
      console.log("call answered with stream", stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log("Received remote stream", userVideoStream);
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connected: " + userId);
});

function connectToNewUser(userId, stream) {
  console.log("connectToNewUser userId: ", userId);
  console.log("connectToNewUser stream: ", stream);
  const call = myPeer.call(userId, stream);

  console.log("connectToNewUser call: ", call);
  try {
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });
  } catch (error) {
    console.log("Error: ", error);
  }
  call.on("error", (error) => {
    console.log("Error: ", error);
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  console.log("video added");
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
