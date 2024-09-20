export const SOCKET_URL =
	process.env.NODE_ENV == "development"
		? // ? "http://localhost:3000/"
			"http://192.168.8.101:3000/"
		: "https://codingwebninja.site/";
// : "https://socketiotest.adaptable.app/";

export const API_URL =
	process.env.NODE_ENV == "development"
		? // ? "http://localhost:3000/api/"
			"http://192.168.8.101:3000/api/"
		: "https://codingwebninja.site/api/";
// : "https://socketiotest.adaptable.app/api/",
// baseURL: "https://socketio-test-rzgz.onrender.com/api/",
