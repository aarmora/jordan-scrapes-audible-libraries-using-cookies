import { google, books_v1 } from 'googleapis';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });


(async () => {

	// const books = google.books({
	// 	version: "v1",
	// 	auth: 'AIzaSyBN0VRQNZBunaT8MLyjQdArM8Tqh4fqFOI'
	// });

	// const params: books_v1.Params$Resource$Volumes$Get = {

	// };

	// const volumes = await books.volumes.get({
	// 	auth: 'AIzaSyBN0VRQNZBunaT8MLyjQdArM8Tqh4fqFOI',

	// });

	const axiosResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=${process.env.googleBooksApiKey}&projection=full`);

	console.log('axios response', axiosResponse.data.items[0].volumeInfo, axiosResponse.data.items[0].searchInfo, axiosResponse.data.items[2].volumeInfo, axiosResponse.data.items[2].searchInfo);

})();