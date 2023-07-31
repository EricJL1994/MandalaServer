function convertDateToTicks(date) {
  var ticksPerMilisecond = 10000;

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond;
}

function resetDate() {
  document.getElementById("timeValue").value = "";
  search();
}

function showDropdown(dropdown) {
  document.getElementById("myDropdown").classList.toggle("showDropdown");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("showDropdown")) {
        openDropdown.classList.remove("showDropdown");
      }
    }
  }
  // const floater = document.getElementById('floater')
  // if(!event.target.matches('.floating') && !document.getElementById('calendar').contains(event.target)) {
  //   console.log(event.target)
  //   floater.style.visibility = 'hidden'
  // }else{
  //   var posx = event.clientX,
  //     posy = event.clientY
  //   console.log(`X: ${posx} - Y: ·${posy}`)
  //   floater.style.left = (posx+10)+'px'
  //   floater.style.top = (posy+10)+'px'
  // }
};

function start(input) {
  sessionStorage.clear();
  input.type = "text";
  input.removeAttribute("src");
  input.parentElement.style.display = "none";
  search();
}

function search() {
  var table = document.getElementById("problemTable");

  var dropdownFilter = document.getElementById("dropdownMenuButton").value.toUpperCase();
  var dateFilter = document.getElementById("timeValue").valueAsDate;
  var hideDone = document.getElementById("showDone").checked;
  var hidePending = !!document.getElementById("showPending")?.checked;

  for (let tr of table.querySelectorAll("#trData")) {
    // TEXT SEARCH
    const searchCriteria = tr.querySelector("#searchCriteria"); 
    // BOULDER DONE
    const userCriteria = tr.querySelector("#userCriteria");
    const doneCriteria = userCriteria ? userCriteria.querySelector("#doneCriteria").checked : true;
    // DATE SEARCH
    const dateCriteria = tr.querySelector("#dateCriteria");
    // PENDING BOULDER
    const pendingCriteria = tr.classList.contains("trProblemPending") ? hidePending : false;

    const txtValue = (searchCriteria.textContent || searchCriteria.innerText).toUpperCase();
    if (
      txtValue.includes(dropdownFilter) &&
      (dateFilter ? parseInt(dateCriteria.textContent) >= convertDateToTicks(dateFilter) : true) &&
      !(hideDone && doneCriteria) &&
      !pendingCriteria
    ) {
      // SHOW
      tr.style.display = "";
    } else {
      // HIDE
      tr.style.display = "none";
    }
  }
}

function filter(dropdownFilter) {
  var dropdown = document.getElementById("dropdownMenuButton");
  // dropdown.parentElement.style.display = "none";
  // setTimeout(function () {
  //   dropdown.parentElement.style.display = "";
  // }, 1);
  //dropdown.parentElement.style.display= ''
  if (!dropdownFilter) {
    dropdown.innerText = "Dificultad ▼";
    dropdown.value = "";
  } else {
    dropdown.innerText =
      document.getElementById(dropdownFilter).textContent + " ▼";
    dropdown.value = dropdownFilter;
  }
  search();
}

function filterDropdown(id, filter, submit) {
  console.log("---------------------------");
  if (submit) document.getElementById(submit).disabled = false;
  const select = document.getElementById(id);
  const options = select.getElementsByTagName("OPTION");
  var selected = select.options[select.selectedIndex];
  // console.log(selected)
  const lastId = selected.value;
  // console.log(lastId)
  // console.log(!(selected.innerText.toUpperCase().indexOf(filter.toUpperCase()) > -1))
  if (!(selected.innerText.toUpperCase().indexOf(filter.toUpperCase()) > -1))
    selected = undefined;
  for (let i = 1; i < options.length; i++) {
    if (options[i].innerText.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
      if (!selected) {
        console.log("Nuevo elegido");
        options[i].selected = true;
        selected = options[i];
        // select.value = lastId
        showUserInfo(select, lastId);
      }
      options[i].style.display = "";
    } else {
      options[i].style.display = "none";
    }
  }
  if (!selected || filter.length == 0) {
    options[0].selected = true;
    if (submit) document.getElementById(submit).disabled = true;
  }
}

function changePermissions(select) {
  const filterId = select.options[select.selectedIndex].value;
  const trows = document
    .getElementById("permissionsTable")
    .getElementsByTagName("TBODY")[0]
    .getElementsByTagName("TR");
  for (const row of trows) {
    if (row.firstChild.innerText == filterId) {
      row.style.display = "";
      // console.log(row.lastChild.id)
      // console.log(document.getElementById('methodmonth'))
      document.getElementById(`method${row.lastChild.id}`).disabled =
        row.lastChild.innerText == "false" &&
        !(filterId == "612cbc6301d5f95906c21dd4");
    } else {
      row.style.display = "none";
    }
    // row.style.display = row.firstChild.innerText == filterId ? "" : "none"
  }

  document.getElementById("method0").selected = true;
  document.getElementById("bookingName").style.display =
    filterId == "612cbc6301d5f95906c21dd4" ? "" : "none";
  // console.log(trows)
}

function showUserInfo(select, lastId) {
  const filterId = select.options[select.selectedIndex].value;
  select.setAttribute(
    "onchange",
    `showUserInfo(this,"${!select.selectedIndex ? lastId : filterId}")`
  );
  if (!!lastId && document.getElementById(lastId)) {
    document.getElementById(lastId).hidden = true;
  }
  document.getElementById(filterId).hidden = false;
}

function boulderDoneResponse(button, id, done) {
  const tr = button.parentElement.parentElement;
  const trClassList = tr.classList;
  // const checkboxMarked = tr.getElementsByTagName("input")[0];
  const checkboxDone = tr.getElementsByTagName("input")[1];
  // checkboxMarked.checked = !checkboxMarked.checked;
  if (done) {
    trClassList.add("trProblemDone");
  } else {
    trClassList.remove("trProblemDone");
  }
  checkboxDone.checked = done;

  button.innerText = done ? "Quitar" : "Marcar";
  search();
}

function boulderDone(button, id, url) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      boulderDoneResponse(button, id, JSON.parse(xhr.response).done);
    }
  };
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ id }));
}

function showFloatingTimeTable(bookings, max, day, td) {
  const timeNames = ["Mañana - ", "Tarde - ", "Noche - "];
  document.getElementById("selectedDate").value = day;
  const dayDetails = document.getElementById("floater");
  dayDetails.getElementsByTagName("th")[0].innerText = "Dia " + day;
  const dayDetailsBody = dayDetails
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  for (let index = 0; index < 3; index++) {
    if (bookings[index] != undefined) {
      dayDetailsBody[index].style.display = "";
      const ratio = bookings[index] / max;
      dayDetailsBody[index].getElementsByTagName("td")[0].innerText =
        timeNames[index] + bookings[index] + "/" + max;
      dayDetailsBody[index].classList.remove("trProblemDone");
      dayDetailsBody[index].classList.remove("trProblemMarked");
      dayDetailsBody[index].classList.remove("trProblemUnmarked");
      dayDetailsBody[index].classList.add(
        ratio > 0.8
          ? "trProblemUnmarked"
          : ratio > 0.5
          ? "trProblemMarked"
          : "trProblemDone"
      );
    } else {
      dayDetailsBody[index].style.display = "none";
    }
  }
  const rows = document
    .getElementById("calendar")
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  for (const row of rows) {
    for (const rowtd of row.getElementsByTagName("td")) {
      rowtd.classList.remove("trProblemDone");
    }
  }
  td.classList.add("trProblemDone");
}

function changeWithText(id, element) {
  document.getElementById(id).value = element.text;
}

const themeMap = {
  light: "dark",
  dark: "light",
  vero: "dark",
};

const theme =
  (localStorage.getItem("theme") == "undefined"
    ? themeMap[0]
    : localStorage.getItem("theme")) ||
  ((tmp = Object.keys(themeMap)[0]), localStorage.setItem("theme", tmp), tmp);

var bodyClass = undefined;

window.onload = function () {
  bodyClass = document.body.classList;
  bodyClass.add(theme);
  // bodyClass.add('vero');
  // localStorage.setItem('theme', 'vero')
  document.getElementById("themeButton").onclick = toggleTheme;
  // getDeviceRatio()
};

function getDeviceRatio() {
  alert("AvalW " + window.screen.availWidth);
  alert("AvalH " + window.screen.availHeight);
  alert("W " + window.screen.width);
  alert("H " + window.screen.height);
  alert("PR " + window.devicePixelRatio);
}

function toggleTheme() {
  const current = localStorage.getItem("theme");
  const next = themeMap[current];

  bodyClass.replace(current, next);
  localStorage.setItem("theme", next);
}

function closeCover(element) {
  element.style.display = "none";

  for (const popup of element.parentElement.getElementsByTagName("div")) {
    if (!popup.style.display) return;
  }
  element.parentElement.style.display = "none";
}

function populateTable() {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState != 4) return;
    if ((this.status = 200))
      populateTableResponse(JSON.parse(xhr.responseText));
  };
  xhr.open("GET", "/api/boulders", true);
  xhr.send();
}

function populateTableResponse(response) {
  //const template = document.getElementById("trtemplate")
  const table = document.getElementById("problemTable");
  let body = table.getElementsByTagName("tbody")[0];
  response.forEach((boulder) => {
    body.innerHTML += createTableRow(boulder);
    // var newRow = template.cloneNode(true)
    // var children = newRow.getElementsByTagName("td")
    // newRow.hidden = false
    // // console.log(row)
    // //- Search criteria
    // children[0].text = `${problem.difficultyName} ${problem.number} ${problem.wallName} ${problem.holdColor}`
    // //- Number and link
    // newRow.getElementsByTagName("td")[1].onclick = `window.location='/boulders/details?difficultyName=${problem.difficultyName}&number=${problem.number}'`
    // children[1].getElementsByTagName("div")[0].style.backgroundColor = problem.color
    // //- Date
    // if(problem.date){
    //   children[2].text = `${problem.dateValue}`
    //   children[3].text = problem.date
    //   const dateArray = problem.date.split('/')
    //   children[4].text = `${dateArray[0]}/${dateArray[1]}`
    // }
    // //- Wall
    // children[5].text = problem.wallName
    // //- Hold color
    // children[6].text = problem.holdColor
    // children[7].text = problem.holdColorShort
    // //- User input
    // children[8].text = "AAAAA"
    // for (let i = 0; i < children.length; i++) {
    //   newRow.replaceChild(children[i], newRow.childNodes[i])
    // }
    // console.log(newRow)
    // body.appendChild(newRow)
  });
}

function createTableRow(problem) {
  var row = "";
  row += `<tr class="trProblem ${
    problem.pending ? "trProblemPending" : problem.done ? "trProblemDone" : ""
  }">`;
  row += `<td class="d-none">${problem.difficultyName} ${problem.number} ${problem.wallName} ${problem.holdColor}</td>`;
  row += `<td onclick="window.location='/boulders/details?difficultyName=${problem.difficultyName}&amp;number=${problem.number}'"><div class="align-center" style="background-color:${problem.color};cursor:pointer;">${problem.number}</div></td>`;
  row += `<td class="d-none" id="dateValue">${problem.dateValue}</td>`;
  const dateArray = problem.date.split("/");
  row += `<td class="small-hide">${problem.date}</td><td class="small-show">${dateArray[0]}/${dateArray[1]}</td>`;
  row += `<td>${problem.wallName}</td>`;
  row += `<td class="small-hide">${problem.holdColor}</td><td class="small-show">${problem.holdColorShort}</td>`;
  row += `<td class="align-center"><button onclick="boulderDone(this, &quot;${
    problem._id
  }&quot;)">${problem.done ? "Quitar" : "Marcar"}</button></td>`;
  if (problem.redpoints)
    row += `<td class="align-center">${problem.redpoints.length}</td></tr>`;
  return row;
}

function addToLeague(button, id, difficultyName, number) {
  // console.log({button, difficultyName, number})
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      addToLeagueResponse(button, JSON.parse(xhr.response).added);
    }
  };
  xhr.open("POST", "/admin/addToLeague/", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ id, difficultyName, number }));
  // xhr.send()
}

function addToLeagueResponse(button, added) {
  const tr = button.parentElement.parentElement;
  const trClassList = tr.classList;
  // const checkboxMarked = tr.getElementsByTagName("input")[0];
  // const checkboxDone = tr.getElementsByTagName("input")[1];
  // checkboxMarked.checked = !checkboxMarked.checked;
  if (added) {
    trClassList.add("trProblemDone");
  } else {
    trClassList.remove("trProblemDone");
  }
  // checkboxDone.checked = done

  button.innerText = added ? "Quitar" : "Añadir";
}

// function selectNumberDropdown(id){
//   console.log(id)
//   var dropdowns = document.querySelectorAll('[id^="difficultyNumbers"]')
//   console.log(dropdowns)
//   for (const dd of dropdowns) {
//     dd.style.display = "none"
//   }
//   document.querySelector(`[id^="difficultyNumbers${id}"]`).style.display = ""
// }
