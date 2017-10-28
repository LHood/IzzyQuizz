console.log('results widget module loaded');
goog.provide('QuizWidget');
goog.require('XhrService');
goog.require('goog.dom');

class displayer {

	constructor() {
		this.results_data = null;
	}

	load_data(){

		return new Promise((resolve) => {
			console.log('will send request'); 
			XhrService.getJSON('/results/data').then((response) => {
				this.results_data = response; console.log('response: ', response);
				resolve('success')
			});
		})

	}

	build(target) {
		target.innerHTML = '';
		const view = this.generate_results_table();
		const viewHolder = goog.dom.createDom('view', {className: 'z-index-1'}, view);
		target.append(viewHolder);
	}

	generate_results_table() {

		const table = goog.dom.createDom('table', {className: 'results_table highlight', align: 'left'});
		
		const headTr = goog.dom.createDom('tr', {}, this.generate_head_elements());
		const HEAD = goog.dom.createDom('thead', null, headTr);
		table.append(HEAD);

		const bodyTrs = this.generate_row_elements();
		const BODY = goog.dom.createDom('tbody', null, bodyTrs);
		table.append(BODY);
		return table;
	}

	generate_head_elements() {
		const profileTH = goog.dom.createDom('th', {className: 'profile-head'}, 'Names');
		const pointsTH = goog.dom.createDom('th', {className: 'points-head'}, 'Total Points');

		return [profileTH, pointsTH];

	}

	generate_row_elements() {
		const results = [];
		for(const resultObject of this.results_data) {
			const userPictureAddress = resultObject.picture;
			const pictureElement = goog.dom.createDom('img', {src: userPictureAddress, className: 'profile-picture'})
			const userName = resultObject.name;
			const nameElement = goog.dom.createDom('div', {className: 'profile-name'}, userName);
			const userTD = goog.dom.createDom('TD', {className: 'user-data-td'}, [pictureElement, nameElement]);
			const userPoints = resultObject.points;
			const pointsElement = goog.dom.createDom('div', {className: 'points-holder'}, userPoints.toString());
			const pointsTd = goog.dom.createDom('TD', {className: 'points-TD'}, pointsElement)

			const TRElement = goog.dom.createDom('tr', {}, [userTD, pointsTd]);

			results.push(TRElement)
		}
		return results
	}
}

const resultsHolder = document.getElementById('resultsHolder');
const displayInstance = new displayer();
displayInstance.load_data().then( () => {displayInstance.build(resultsHolder)});

function initialize() {

	displayInstance.load_data().then( () => {displayInstance.build(resultsHolder)});
}

setInterval(initialize, 15000);