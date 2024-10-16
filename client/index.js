import { io } from "socket.io-client";

const loginInfoDiv = document.querySelector(".loginfo_div"); //Sign Up Button Div
const loginBox = document.querySelector(".login_overlay"); //Login Box Overlay
const registerBox = document.querySelector(".register_overlay"); //Register Box Overlay
const typeForm = document.querySelector(".type_form"); //message typing form
const loginForm = document.getElementById("loginForm"); //login form
const registerForm = document.getElementById("registerForm"); //register form
const messageDiv = document.querySelector(".messages_div");

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const socket = io("http://localhost:3001");

getChat();

socket.on("receive_message", (name, id, text) => {
  const data = [
    {
      name: name,
      userid: id,
      text: text,
    },
  ];
  addTextToDiv(data);
  messageDiv.scrollTop = messageDiv.scrollHeight;
});

//check if user mongo id saved in local storage
if (localStorage.getItem("userInfo")) {
  typeForm.style.display = "grid";
  addUserName();
} else {
  typeForm.style.display = "none";
  addRegisterBtn();
}

async function getChat() {
  const data = await getChatFromMongo();
  await refreshChats();
  await addTextToDiv(data);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

//add messages to div
async function addTextToDiv(data) {
  const localID = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).id
    : null;
  data.forEach((element) => {
    const textDiv = document.createElement("div");
    textDiv.className = "chat_div";

    const textBox = document.createElement("div");
    textBox.className = "chat_box";
    const name = document.createElement("p");
    name.innerHTML = element.name;
    name.style.color = "grey";
    name.style.fontSize = "16px";
    const text = document.createElement("p");
    text.innerHTML = element.text;
    if (element.userid == localID) {
      textDiv.style.justifyContent = "end";
      textBox.style.textAlign = "right";
    }
    textBox.append(name, text);
    textDiv.append(textBox);
    messageDiv.append(textDiv);
  });
}

//set messages in div to null
async function refreshChats() {
  messageDiv.innerHTML = "";
}

//get messages from mongo
async function getChatFromMongo() {
  try {
    const res = await fetch("http://localhost:3001/chats");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

//adds user name in navbar
function addUserName() {
  const userName = document.createElement("h1");
  userName.innerHTML = JSON.parse(localStorage.getItem("userInfo")).name;
  userName.style.marginRight = "20px";
  loginInfoDiv.append(userName);
  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logoutBtn";
  logoutBtn.innerHTML = "Logout";
  logoutBtn.style.backgroundColor = "crimson";
  loginInfoDiv.append(logoutBtn);
}

//adds sign in and sign up button in navbar
function addRegisterBtn() {
  const loginBtn = document.createElement("button");
  const registerBtn = document.createElement("button");
  loginBtn.id = "loginBtn";
  registerBtn.id = "registerBtn";
  loginBtn.innerHTML = "Sign In";
  registerBtn.innerHTML = "Sign Up";
  loginInfoDiv.append(loginBtn, registerBtn);
}

//sign in button click
if (document.getElementById("loginBtn")) {
  document.getElementById("loginBtn").addEventListener("click", () => {
    loginBox.style.display = "flex";
    registerBox.style.display = "none";
  });
}

//sign up button click
if (document.getElementById("registerBtn")) {
  document.getElementById("registerBtn").addEventListener("click", () => {
    loginBox.style.display = "none";
    registerBox.style.display = "flex";
  });
}

//logout button click
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    console.log("logout");
    localStorage.removeItem("userInfo");
    window.location.reload();
  });
}

//type form submit
typeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  chatToMongo();
});

//fetch request for post to mongoDB in chat
async function chatToMongo() {
  try {
    const localName = JSON.parse(localStorage.getItem("userInfo")).name;
    const localID = JSON.parse(localStorage.getItem("userInfo")).id;
    const text = document.getElementById("typeInput").value;
    socket.emit("new_message", localName, localID, text);
    await fetch("http://localhost:3001/chats", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name: localName,
        userid: localID,
        text: text,
      }),
    });
    document.getElementById("typeInput").value = "";
  } catch (err) {
    console.error(err);
  }
}

//register status text
function registerStatus(color = "#ddd", message = "") {
  document.getElementById("statusRegisterId").style.color = color;
  document.getElementById("statusRegisterId").innerHTML = message;
}

//check if email, name and password entered in Register
document
  .getElementById("emailRegisterId")
  .addEventListener("input", (event) => {
    registerStatus();
    if (emailRegex.test(event.target.value)) {
      registerButtonEnable();
    } else {
      registerStatus("crimson", "Email Syntax Error");
    }
  });
document.getElementById("nameRegisterId").addEventListener("input", (event) => {
  registerStatus();
  registerButtonEnable();
});
document
  .getElementById("passwordRegisterId")
  .addEventListener("input", (event) => {
    registerStatus();
    registerButtonEnable();
  });

function registerButtonEnable() {
  if (
    document.getElementById("emailRegisterId").value &&
    document.getElementById("nameRegisterId").value &&
    document.getElementById("passwordRegisterId").value
  ) {
    document.getElementById("buttonRegisterId").disabled = false;
  } else {
    document.getElementById("buttonRegisterId").disabled = true;
  }
}

//register form submit click
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  dataEntry();
});

//send register email , name , password to mongoDB
async function dataEntry() {
  const data = await addtoMongo();
  if (data.status == "User Created") {
    registerStatus("yellowgreen", "Register Successfully");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    registerStatus("crimson", data.status);
  }
}

//fetch request for post to mongoDB in register
async function addtoMongo() {
  try {
    const res = await fetch("http://localhost:3001/signup", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("nameRegisterId").value,
        email: document.getElementById("emailRegisterId").value,
        password: document.getElementById("passwordRegisterId").value,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

//login status text
function loginStatus(color = "#ddd", message = "") {
  document.getElementById("statusLoginId").style.color = color;
  document.getElementById("statusLoginId").innerHTML = message;
}

//check if email and password entered in Login
document.getElementById("emailLoginId").addEventListener("input", (event) => {
  loginStatus();
  if (emailRegex.test(event.target.value)) {
    loginButtonEnable();
  } else {
    loginStatus("crimson", "Email Syntax Error");
  }
});
document
  .getElementById("passwordLoginId")
  .addEventListener("input", (event) => {
    loginStatus();
    loginButtonEnable();
  });

function loginButtonEnable() {
  if (
    document.getElementById("emailLoginId").value &&
    document.getElementById("passwordLoginId").value
  ) {
    document.getElementById("buttonLoginId").disabled = false;
  } else {
    document.getElementById("buttonLoginId").disabled = true;
  }
}

//Login form submit click
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  dataCheck();
});

//check login email , password from mongoDB
async function dataCheck() {
  const data = await checkMongo();
  if (data.status == "Login Successfully") {
    loginStatus("yellowgreen", "Login Successfully");
    const localData = {
      name: data.name,
      id: data.id,
    };
    localStorage.setItem("userInfo", JSON.stringify(localData));
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    loginStatus("crimson", data.status);
  }
}

//fetch request for post to mongoDB in login
async function checkMongo() {
  try {
    const res = await fetch("http://localhost:3001/login", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("emailLoginId").value,
        password: document.getElementById("passwordLoginId").value,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
