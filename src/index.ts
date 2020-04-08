import puppeteer, { BrowserContext, Page } from 'puppeteer';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: __dirname + '/../.env' });


const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(pluginStealth());

(async () => {
	const dbUrl = `mongodb://${process.env.dbUser}:${process.env.dbPass}@${process.env.dbUrl}/${process.env.dbName}`;
	let dbClient: MongoClient;
	try {
		dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
	}
	catch (e) {
		console.log('error connecting', e);
	}
	const db = dbClient.db();
	const collection = 'books';

	const browser = await puppeteerExtra.launch({ headless: false });

	const cookies = [
		process.env.jordanCookie,
		process.env.jonCookie,
		process.env.ashliCookie
	];

	const existingBooks: any[] = await db.collection(collection).find({}).toArray();
	const books: any[] = [];

	for (let i = 0; i < cookies.length; i++) {
		let failing = true;

		while (failing && cookies[i]) {
			const context = await browser.createIncognitoBrowserContext();
			let page: Page;
			try {
				page = await auth(context, cookies[i]);
				failing = false;
			}
			catch (e) {
				console.log('Error', e);
				await context.close();
				continue;
			}

			try {
				const bookData = await getBooks(page, existingBooks);
				books.push(...bookData);
			}
			catch (e) {
				console.log('failed getting books', e);
				await context.close();
			}

			console.log('books length', books.length);
		}
	}

	for (let i = 0; i < books.length; i++) {
		await db.collection(collection).updateOne({ title: books[i].title }, { $set: books[i] }, { upsert: true });
	}

	await browser.close();

	await dbClient.close();

})();


async function getBooks(page: Page, existingBooks: any[]) {
	const bookData: any[] = [];

	try {
		let notTheEnd = true;
		let pageNumber = 1;
		const libraryUrl = 'https://audible.com/library/titles';

		while (notTheEnd) {
			let owner = await page.$eval('.bc-text.navigation-do-underline-on-hover.ui-it-barker-text', element => element.textContent);

			// This breaks if nothing is left after the split
			owner = owner.split(',')[1].replace('!', '').trim();

			const booksHandle = await page.$$('.adbl-library-content-row');
			for (let bookHandle of booksHandle) {
				const title = await bookHandle.$eval('.bc-text.bc-size-headline3', element => element.textContent);
				const author = await bookHandle.$eval('.bc-text.bc-size-callout', element => element.textContent);
				const image = await bookHandle.$eval('img', element => element.getAttribute('src'));
				let url: string;
				try {
					url = await bookHandle.$eval('.bc-list-item:nth-of-type(1) .bc-link.bc-color-base', element => element.getAttribute('href'));
				}
				catch (e) {
					console.log('Cannot find url. Probably a journal. I do not want it.');
				}

				// Only add if it does not find
				if (!existingBooks.find(book => book.title === title) && url) {

					bookData.push({
						title: title.trim(),
						author: author.trim(),
						image: image,
						url: url,
						owner: owner
					});
				}

			}
			const pagingElementHandles = await page.$$('.pagingElements li');
			// Let's check if the last one is disabled
			const lastPageElementClasses = await pagingElementHandles[pagingElementHandles.length - 1].$eval('span', element => element.classList);

			// If one of the classes on the last one is disabled, we know we're at the end and we should stop
			if (Object.values(lastPageElementClasses).includes('bc-button-disabled')) {
				notTheEnd = false;
			}
			else {
				pageNumber++;
				await page.goto(`${libraryUrl}?page=${pageNumber}`);
			}

		}
	}
	catch (e) {
		throw e;
	}

	return bookData;
}

async function auth(context: BrowserContext, cookie: string) {

	const page = await context.newPage();

	const cookies: puppeteer.Cookie[] = [
		{
			name: "x-main",
			value: cookie,
			domain: ".audible.com",
			path: '/'

		} as puppeteer.Cookie
	];

	await page.goto('https://audible.com');

	// Set cookie and then go to library
	await page.setCookie(...cookies);
	const libraryUrl = 'https://audible.com/library/titles';
	await page.goto(libraryUrl);

	try {
		await page.$eval('.adbl-library-content-row', element => element.textContent);
	}
	catch (e) {
		throw e;
	}

	return page;
}