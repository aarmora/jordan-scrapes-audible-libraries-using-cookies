# Audible Library Scraper

Logs in to your audible library and compiles an array of your books.

## Getting Started
```
npm install
```

Change `example.env` to `.env` and add the cookies for your audible library. In order to get this cookie, you'll need to login and copy the "x-main" cookies into the .env file.

Then simply run:

```
npm start
```

For further information, see [this tutorial](https://javascriptwebscrapingguy.com/jordan-scrapes-audible-with-cookies/).

### Prerequisites

Tested on Node v12.4.0 and NPM v6.9.0

## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Scraping library

## Authors

* **Jordan Hansen** - *Initial work* - [Jordan Hansen](https://github.com/aarmora)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details