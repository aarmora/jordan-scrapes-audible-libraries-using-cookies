import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });


(async () => {

	const axiosResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=${process.env.googleBooksApiKey}&projection=full`);

	console.log('axios response', axiosResponse.data.items[0].volumeInfo, axiosResponse.data.items[0].searchInfo, axiosResponse.data.items[2].volumeInfo, axiosResponse.data.items[2].searchInfo);

})();