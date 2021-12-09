function convertDateToTicks(date) {
  var ticksPerMilisecond = 10000;

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond;
}

function resetDate() {
  document.getElementById("timeValue").value = "2021-02-22";
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
  // search(input.value);
  search("");
}

function search(searchText, dropdownFilterText, timeFilterText) {
  //var searchFilter = (searchText ? searchText : document.getElementById('problemSearch').value + '')
  var dropdownFilter = (
    dropdownFilterText
      ? dropdownFilterText
      : document.getElementById("dropdownMenuButton").value
  ).toUpperCase();
  var d = timeFilterText
    ? timeFilterText
    : document.getElementById("timeValue").valueAsDate;

  //var filter = searchFilter.toUpperCase().trim()
  var table = document.getElementById("problemTable");
  var tr = table.getElementsByTagName("tr");
  var td, timetd, txtValue;

  for (let index = 1; index < tr.length; index++) {
    td = tr[index].getElementsByTagName("td")[0];
    const td8 = tr[index].getElementsByTagName("td")[8];
    const done = td8 ? td8.getElementsByTagName("input")[1].checked : true;
    timetd = tr[index].getElementsByTagName("td")[2];

    if (td) {
      txtValue = (td.textContent || td.innerText).toUpperCase();
      if (
        /*txtValue.includes(filter) &&*/
        txtValue.includes(dropdownFilter) &&
        (d ? parseInt(timetd.textContent) >= convertDateToTicks(d) : true) &&
        !(document.getElementById("showDone").checked && done)
      ) {
        tr[index].style.display = "";
      } else {
        tr[index].style.display = "none";
      }
    }
  }
}

function filter(dropdownFilter) {
  var dropdown = document.getElementById("dropdownMenuButton");
  dropdown.parentElement.style.display = "none";
  setTimeout(function () {
    dropdown.parentElement.style.display = "";
  }, 1);
  //dropdown.parentElement.style.display= ''
  if (!dropdownFilter) {
    dropdown.innerText = "Dificultad ▼";
    dropdown.value = "";
  } else {
    dropdown.innerText =
      document.getElementById(dropdownFilter).textContent + " ▼";
    dropdown.value = dropdownFilter;
  }

  search(undefined, dropdown.value);
}

function filterDropdown(id, filter, submit){
  document.getElementById(submit).disabled = false
  const select = document.getElementById(id)
  const options = select.getElementsByTagName("OPTION")
  var selected = select.options[select.selectedIndex]
  if(!selected.innerText.toUpperCase().indexOf(filter.toUpperCase()) > -1) selected = undefined;
  for (let i = 1; i < options.length; i++) {
    if(options[i].innerText.toUpperCase().indexOf(filter.toUpperCase()) > -1){
      if(!selected) {
        options[i].selected = true
        selected = options[i]
      }
      options[i].style.display = ""
    }else{
      options[i].style.display = "none"
    }
  }
  if(!selected){
    options[0].selected = true
    document.getElementById(submit).disabled = true
  } 
}

function changePermissions(select){
  const filterId = select.options[select.selectedIndex].value
  const trows = document.getElementById("permissionsTable").getElementsByTagName("TBODY")[0].getElementsByTagName("TR")
  for (const row of trows) {
    if(row.firstChild.innerText == filterId){
      row.style.display = ""
      // console.log(row.lastChild.id)
      // console.log(document.getElementById('methodmonth'))
      document.getElementById(`method${row.lastChild.id}`).disabled = (row.lastChild.innerText == "false") && !(filterId == "612cbc6301d5f95906c21dd4")
    }else{
      row.style.display = "none"
    }
    // row.style.display = row.firstChild.innerText == filterId ? "" : "none"
  }
  
  document.getElementById("method0").selected = true
  document.getElementById("bookingName").style.display = filterId == "612cbc6301d5f95906c21dd4" ? "" : "none"
  // console.log(trows)
}

function timer(timeFilter) {
  // document.getElementById('timeValue').value = timeFilter
  search(undefined, undefined, timeFilter);
}

function boulderDone(button, id) {
  const tr = button.parentElement.parentElement;
  const trClassList = tr.classList;
  const checkboxMarked = tr.getElementsByTagName("input")[0];
  const checkboxDone = tr.getElementsByTagName("input")[1];
  checkboxMarked.checked = !checkboxMarked.checked;
  if (checkboxDone.checked) {
    if (checkboxMarked.checked) {
      trClassList.remove("trProblemDone");
      trClassList.add("trProblemUnmarked");
      button.innerText = "Cancelar";
    } else {
      trClassList.add("trProblemDone");
      trClassList.remove("trProblemUnmarked");
      button.innerText = "Quitar";
    }
  } else {
    if (checkboxMarked.checked) {
      trClassList.remove("bg-light");
      trClassList.add("trProblemMarked");
      button.innerText = "Desmarcar";
    } else {
      trClassList.add("bg-light");
      trClassList.remove("trProblemMarked");
      button.innerText = "Marcar";
    }
  }

  var problems = [];
  if (sessionStorage.problemsDone) {
    problems = JSON.parse(sessionStorage.problemsDone);
  }

  var found = false;
  for (let index = 0; index < problems.length; index++) {
    const problem = problems[index];
    if (problem.id == id) {
      found = true;
      problems.splice(index, 1);
      index -= 1;
    }
  }
  if (!found) problems.push(id);
  sessionStorage.problemsDone = JSON.stringify(problems);
  const inputP = document.getElementById("problemsToSubmit");
  inputP.value = JSON.stringify(sessionStorage.problemsDone);
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
  const rows = document.getElementById("calendar").getElementsByTagName("tbody")[0].getElementsByTagName("tr")
  for (const row of rows) {
    for (const rowtd of row.getElementsByTagName("td")) {
      rowtd.classList.remove("trProblemDone");
    }
  }
  td.classList.add("trProblemDone");
}

const themeMap = {
  dark: "light",
  light: "dark",
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
};

function toggleTheme() {
  const current = localStorage.getItem("theme");
  const next = themeMap[current];

  bodyClass.replace(current, next);
  localStorage.setItem("theme", next);
}

function closeCover(element){
  element.style.display = "none"

  for (const popup of element.parentElement.getElementsByTagName("div")) {
    if(!popup.style.display) return
  }
  element.parentElement.style.display = "none"
}
