//variables

let result;
let response1;
let response2;
let quotes1;
let quotes2;
let quotes3 = [{
	ccy: 'UAH'
}];
let quotes;
let leftToRight;
let rightToLeft;
let formulas = {};


//Get elements from HTML

const ticker = document.querySelectorAll('.conv__ticker');
const flag = document.querySelectorAll('.flag');
const text = document.querySelectorAll('.conv__inputArea');


//Plus zero function

function plusZero (val) {
	if (String(val).length == 1) {
		return '0' + String(val);
	} else {
		return val;
	}
}


//Update date and time function

function updateDate () {

	let updateTime = new Date();

	let day = updateTime.getDate();
	day = plusZero (day);

	let month = updateTime.getMonth() + 1;
	month = plusZero (month);

	let year = updateTime.getFullYear();

	let hours = updateTime.getHours();
	hours = plusZero (hours);

	let minutes = updateTime.getMinutes();
	minutes = plusZero (minutes);

	let seconds = updateTime.getSeconds();
	seconds = plusZero (seconds);
	
	let updateMessage = `Last update:  ${hours}:${minutes}:${seconds}  ${day}.${month}.${year}`;

	return updateMessage;
}


//Load currencies in HTML function

function loadCurrInSelect () {

	for (n=0; n<ticker.length; n++) {

		for (i=0; i<quotes.length; i++) {
			let elem = document.createElement('option');

			elem.innerHTML = `${quotes[i].ccy}`;
			ticker[n].append(elem);
		}
	}

	ticker[1].options[ticker[1].selectedIndex].nextElementSibling.selected = true;
}


//Add flags in quotes object

function addFlags () {

	for (i=0; i<quotes.length; i++) {
		quotes[i].flag = `img/flags/${quotes[i].ccy}.png`;
	}

}


//Load flags in HTML

function loadFlags () {

	 for (i=0; i<2; i++) {
		let tic = ticker[i].options[ticker[i].selectedIndex].value;

		for (elem of quotes) {
			if (elem.ccy == tic) {
				flag[i].src = elem.flag;
			}
		}

		text[i].value = '';
	}
}


//Get formulas from JSON object

function getFormulas () {

	for (n=0; n<quotes.length-1; n++) {

		for (i=0; i<quotes.length-1; i++) {
			if (quotes[n] != quotes[i]) {
				formulas[`${quotes[n].ccy}to${quotes[i].ccy}`] = quotes[n].buy / quotes[i].sale;				
			} else {
				formulas[`${quotes[n].ccy}to${quotes[i].ccy}`] = 1;
			}
		}
	}

	for (i=0; i<quotes.length-1; i++) {
		formulas[`${quotes[11].ccy}to${quotes[i].ccy}`] = 1 / quotes[i].sale;
	}

	for (i=0; i<quotes.length-1; i++) {
		formulas[`${quotes[i].ccy}to${quotes[11].ccy}`] = Number(quotes[i].buy);	
	}

	formulas['UAHtoUAH'] = 1;
}


//Choose formulas to selected quotes

function selectedValues () {

	let val1 = `${ticker[0].options[ticker[0].selectedIndex].value}to${ticker[1].options[ticker[1].selectedIndex].value}`;
	let val2 = `${ticker[1].options[ticker[1].selectedIndex].value}to${ticker[0].options[ticker[0].selectedIndex].value}`;

	leftToRight = formulas[val1];
	rightToLeft = formulas[val2];
}


//Loading data from API function

async function loadQuotes () {

	document.querySelector('.conv__date').innerHTML = "Data update...";
	response1 = await fetch('https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=3');
	quotes1 = await response1.json();
	response2 = await fetch('https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=4');
	quotes2 = await response2.json();

	quotes = [...quotes1, ...quotes2, ...quotes3];
	quotes.splice(1, 1);
	quotes.splice(2, 1);
	quotes.splice(11, 1);
	quotes[9].ccy = 'PLN';

	addFlags();
	loadCurrInSelect();
	loadFlags();
	getFormulas();
	selectedValues();

	document.querySelector('.conv__date').innerHTML = updateDate();
};


//Apply loading data

loadQuotes();
setInterval(loadQuotes, 300000);


//Choose flags for choiced quotes, change formulas for selected quotes

for (i=0; i<ticker.length; i++) {

	ticker[i].addEventListener('change', function() {
		
		loadFlags();
		selectedValues();
	})
};


//Regular expressions for text areas, calculations, clear text areas

text[0].addEventListener('input', function() {

	this.value = this.value.replace(/[^\d]/g, '');
	this.value = this.value.replace(/^0+/, '');

	text[1].value = Math.round((text[0].value * leftToRight) * 100)/100;

	if (text[0].value == false) {
		text[1].value = '';
	}
});

text[1].addEventListener('input', function() {
	
	this.value = this.value.replace(/[^\d]/g, '');
	this.value = this.value.replace(/^0+/, '');

	text[0].value = Math.round((text[1].value * rightToLeft) * 100)/100;

	if (text[1].value == false) {
		text[0].value = '';
	}
});
