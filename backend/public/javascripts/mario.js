/* global variable */
TOTAL_STAGE = 12;
clear_stage_list = new Array();
fail_stage_list = new Array();
last_stage = -123;
random_stage = new Array();

clear_stage_list_mini = new Array();
fail_stage_list_mini = new Array();
last_stage_mini = -123;
random_stage_mini = new Array();

clear_stage_list_arc = new Array();
fail_stage_list_arc = new Array();
last_stage_arc = -123;
random_stage_arc = new Array();

/* @@@@@@@@@@@@@@@@@ 돌아가는 별자리 함수 @@@@@@@@@@@@@@@@@ */
/* 랜덤 int 가져오는 함수 */
function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/* 엄청난 별자리 배경 함수 */
const makeStars = () => {
	var style = ["style1", "style2", "style3"];
	var tam = ["tam1", "tam1", "tam2", "tam2", "tam3"];
	var opacity = ["opacity1", "opacity2"];

	const maxSize = 2000;
	const _size = Math.floor(maxSize / 4);
	const $sky = document.querySelector(".sky");
	const htmlDummy = new Array(_size)
		.fill()
		.map((_, i) => {
			var cls =
				"star " +
				style[getRandomArbitrary(0, 3)] +
				" " +
				opacity[getRandomArbitrary(0, 2)] +
				" " +
				tam[getRandomArbitrary(0, 5)] +
				"' style='animation-delay: ." +
				getRandomArbitrary(0, 9) +
				"s; left: " +
				getRandomArbitrary(0, maxSize) +
				"px; top: " +
				getRandomArbitrary(0, maxSize) +
				"px;'";
			return `<span class='${cls}></span>`;
		})
		.join("");
	$sky.innerHTML = htmlDummy;
};
/* @@@@@@@@@@@@@@@@@ 돌아가는 별자리 함수 @@@@@@@@@@@@@@@@@ */

/* cookie 설정 : 호출시 쿠키 데이터 최신화*/
function setCookieData() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl=" + clear_stage_list.join("@");
		document.cookie = "fsl=" + fail_stage_list.join("@");
		document.cookie = "ls=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		random_stage = getRandom(
			5948,
			6496,
			TOTAL_STAGE
		); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		document.cookie = "rs=" + random_stage.join("@");
	}
}

/* save data in cookies */
function checkResult() {
	if (last_stage != -123) {
		/* correct */
		var num = last_stage;
		if (window.location.href.split("?").at(-1) == "true") {
			clear_stage_list.push(num);
			document.cookie = "csl=" + clear_stage_list.join("@");
		} else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list.push(num);
			document.cookie = "fsl=" + fail_stage_list.join("@");
		}
		document.cookie = "ls=" + String(-123);
		last_stage = -123;
		location.href = "/mario";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblemMario(" +
				random_stage[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}

	for (let elem of clear_stage_list) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	for (let elem of fail_stage_list) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

/* go to problem*/
function enterProblemMario(problem, stage) {
	document.cookie = "ls=" + String(stage);
	location.href = "/mario/anonymous/" + String(problem);
}

/* function for submit button */
function submitSolutionMario(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < divnum / rownum; j++) {
			const index = i * (divnum / rownum) + j;
			const div = divs[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Store the number in the row array
		}

		numbersArray.push(rowArray); // Store the row array in the main array
	}

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[0][1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[0][1].grid.length; i++) {
		for (let j = 0; j < input[0][1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
		}
	}
	console.log(input[0][1].grid);
	answer = compareArrays(numbersArray, input[0][1].grid);
	var retVal = "";

	if (!answer) {
		retVal = "false";
		alert("Wrong!");
	} else {
		retVal = "true";
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/mario?" + retVal;
}

/* super secret */
function superSecret() {
	if (TOTAL_STAGE == clear_stage_list.length) {
		alert("Congraturation!");
		if (!confirm("Reset?")) {
			// alert("None")
		} else {
			document.cookie = "csl=";
			document.cookie = "fsl=";
			document.cookie = "ls=";
			document.cookie = "rs=";
			window.location.reload();
		}
	} else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl=";
			document.cookie = "fsl=";
			document.cookie = "ls=";
			document.cookie = "rs=";
			window.location.reload();
		}
	}
}


// Mini ARC competition을 위한 코드
function setCookieData_mini() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls_mini") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage_mini = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl_mini=" + clear_stage_list_mini.join("@");
		document.cookie = "fsl_mini=" + fail_stage_list_mini.join("@");
		document.cookie = "ls_mini=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		// random_stage = getRandom(
		// 	5948,
		// 	6496,
		// 	TOTAL_STAGE
		// ); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		random_stage_mini = [5952,5971,5978,5983,6015,6018,6021,6022,6026,6033,6048,6055]
		document.cookie = "rs_mini=" + random_stage_mini.join("@");
	}
}

/* save data in cookies */
function checkResult_mini() {
	if (last_stage_mini != -123) {
		/* correct */
		var num = last_stage_mini;
		if (window.location.href.split("?").at(-1) == "true") {
			clear_stage_list_mini.push(num);
			document.cookie = "csl_mini=" + clear_stage_list_mini.join("@");
		} else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list_mini.push(num);
			document.cookie = "fsl_mini=" + fail_stage_list_mini.join("@");
		}
		document.cookie = "ls_mini=" + String(-123);
		last_stage_mini = -123;
		location.href = "/mini_competition";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage_mini.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblem_mini(" +
				random_stage_mini[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}

	for (let elem of clear_stage_list_mini) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list_mini.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	for (let elem of fail_stage_list_mini) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

function enterProblem_mini(problem, stage) {
	document.cookie = "ls_mini=" + String(stage);
	location.href = "/mini_competition/anonymous/" + String(problem);
}

function submitSolutionMarioMini(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < divnum / rownum; j++) {
			const index = i * (divnum / rownum) + j;
			const div = divs[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Store the number in the row array
		}

		numbersArray.push(rowArray); // Store the row array in the main array
	}

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[0][1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[0][1].grid.length; i++) {
		for (let j = 0; j < input[0][1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
		}
	}
	console.log(input[0][1].grid);
	answer = compareArrays(numbersArray, input[0][1].grid);
	var retVal = "";

	if (!answer) {
		retVal = "false";
		alert("Wrong!");
	} else {
		retVal = "true";
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/mini_competition?" + retVal;
}

/* super secret */
function superSecret_mini() {
	if (TOTAL_STAGE == clear_stage_list.length) {
		alert("Congraturation!");
		if (!confirm("Reset?")) {
			// alert("None")
		} else {
			document.cookie = "csl_mini=";
			document.cookie = "fsl_mini=";
			document.cookie = "ls_mini=";
			document.cookie = "rs_mini=";
			window.location.reload();
		}
	} else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl_mini=";
			document.cookie = "fsl_mini=";
			document.cookie = "ls_mini=";
			document.cookie = "rs_mini=";
			window.location.reload();
		}
	}
}

// ARC competition을 위한 코드
function setCookieData_arc() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls_arc") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage_arc = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl_arc=" + clear_stage_list_arc.join("@");
		document.cookie = "fsl_arc=" + fail_stage_list_arc.join("@");
		document.cookie = "ls_arc=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		// random_stage = getRandom(
		// 	5948,
		// 	6496,
		// 	TOTAL_STAGE
		// ); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		random_stage_arc = [6268,6303,6241,6247,6309,6271,6490,6299,6291,6410,6186,6227]
		document.cookie = "rs_arc=" + random_stage_arc.join("@");
	}
}


function checkResult_arc() {
	if (last_stage_arc != -123) {
		/* correct */
		var num = last_stage_arc;
		if (window.location.href.split("?").at(-1) == "true") {
			clear_stage_list_arc.push(num);
			document.cookie = "csl_arc=" + clear_stage_list_arc.join("@");
		} else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list_arc.push(num);
			document.cookie = "fsl_arc=" + fail_stage_list_arc.join("@");
		}
		document.cookie = "ls_arc=" + String(-123);
		last_stage_arc = -123;
		location.href = "/arc_competition";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage_arc.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblem_arc(" +
				random_stage_arc[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}

	for (let elem of clear_stage_list_arc) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list_arc.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	for (let elem of fail_stage_list_arc) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

function enterProblem_arc(problem, stage) {
	document.cookie = "ls_arc=" + String(stage);
	location.href = "/arc_competition/anonymous/" + String(problem);
}

function submitSolutionMarioARC(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < divnum / rownum; j++) {
			const index = i * (divnum / rownum) + j;
			const div = divs[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Store the number in the row array
		}

		numbersArray.push(rowArray); // Store the row array in the main array
	}

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[0][1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[0][1].grid.length; i++) {
		for (let j = 0; j < input[0][1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
		}
	}
	console.log(input[0][1].grid);
	answer = compareArrays(numbersArray, input[0][1].grid);
	var retVal = "";

	if (!answer) {
		retVal = "false";
		alert("Wrong!");
	} else {
		retVal = "true";
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/arc_competition?" + retVal;
}

/* super secret */
function superSecret_arc() {
	if (TOTAL_STAGE == clear_stage_list.length) {
		alert("Congraturation!");
		if (!confirm("Reset?")) {
			// alert("None")
		} else {
			document.cookie = "csl_arc=";
			document.cookie = "fsl_arc=";
			document.cookie = "ls_arc=";
			document.cookie = "rs_arc=";
			window.location.reload();
		}
	} else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl_arc=";
			document.cookie = "fsl_arc=";
			document.cookie = "ls_arc=";
			document.cookie = "rs_arc=";
			window.location.reload();
		}
	}
}