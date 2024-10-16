export const SOCKET_URL =
	process.env.NODE_ENV == "development"
		? // ? "http://localhost:3000/"
			"https://informed-ghoul-glorious.ngrok-free.app/"
		: "https://api.codingwebninja.site/";
// : "https://socketiotest.adaptable.app/";

export const API_URL =
	process.env.NODE_ENV == "development"
		? // ? "http://localhost:3000/"
			"https://informed-ghoul-glorious.ngrok-free.app/"
		: "https://api.codingwebninja.site/";
// : "https://socketiotest.adaptable.app/api/",
// baseURL: "https://socketio-test-rzgz.onrender.com/api/",
