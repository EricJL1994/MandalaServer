function convertDateToTicks(date){
  var ticksPerMilisecond = 10000

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond
}

function resetDate(){
  document.getElementById('timeValue').value = '2021-02-22'
  search()
}

function showDropdown(dropdown){
  document.getElementById("myDropdown").classList.toggle("show")
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function start(input){
  sessionStorage.clear()
  input.type = "text";
  input.removeAttribute("src");
  input.style.display = 'none';
  search(input.value)
}

function search (searchText, dropdownFilterText, timeFilterText) {
  //var searchFilter = (searchText ? searchText : document.getElementById('problemSearch').value + '')
  var dropdownFilter = (dropdownFilterText ? dropdownFilterText : document.getElementById('dropdownMenuButton').value).toUpperCase()
  var d = timeFilterText ? timeFilterText : document.getElementById('timeValue').valueAsDate
  
  
  //var filter = searchFilter.toUpperCase().trim()
  var table = document.getElementById('problemTable')
  var tr = table.getElementsByTagName('tr')
  var td, timetd, txtValue;
  
  for (let index = 1; index < tr.length; index++) {
    td = tr[index].getElementsByTagName('td')[0]
    const td8 = tr[index].getElementsByTagName('td')[8]
    const done = td8 ? td8.getElementsByTagName('input')[1].checked : true
    timetd = tr[index].getElementsByTagName('td')[2]
    
    if (td) {
      txtValue = (td.textContent || td.innerText).toUpperCase()
      if (/*txtValue.includes(filter) &&*/
      txtValue.includes(dropdownFilter) &&
      (d ? parseInt(timetd.textContent) >= convertDateToTicks(d) : true) &&
      !(document.getElementById('showDone').checked && done)) {
        
        tr[index].style.display = ''
      } else {
        tr[index].style.display = 'none'
      }
    }
  }
}

function filter (dropdownFilter) {
  var dropdown = document.getElementById('dropdownMenuButton')
  dropdown.parentElement.style.display= 'none'
  setTimeout(function() { dropdown.parentElement.style.display= '' }, 1);
  //dropdown.parentElement.style.display= ''
  if (!dropdownFilter) {
    dropdown.innerText = /*'Dificultad'*/screen.width
    dropdown.value = ''
  } else {
    dropdown.innerText = document.getElementById(dropdownFilter).textContent
    dropdown.value = dropdownFilter
  }
  
  search(undefined, dropdown.value)
}

function timer(timeFilter){
  // document.getElementById('timeValue').value = timeFilter
  search(undefined, undefined, timeFilter)
}

function boulderDone(button, id){
  const tr = button.parentElement.parentElement
  const trClassList = tr.classList
  const checkboxMarked = tr.getElementsByTagName('input')[0]
  const checkboxDone = tr.getElementsByTagName('input')[1]
  checkboxMarked.checked = !checkboxMarked.checked
  if(checkboxDone.checked){
    if (checkboxMarked.checked) {
      trClassList.remove('trProblemDone')
      trClassList.add('trProblemUnmarked')
      button.innerText = 'Cancelar'
    }else{
      trClassList.add('trProblemDone')
      trClassList.remove('trProblemUnmarked')
      button.innerText = 'Quitar'
    }
  }else{
    if (checkboxMarked.checked) {
      trClassList.remove('bg-light')
      trClassList.add('trProblemMarked')
      button.innerText = 'Desmarcar'
    }else{
      trClassList.add('bg-light')
      trClassList.remove('trProblemMarked')
      button.innerText = 'Marcar'
    }
  }

  var problems = []
  if(sessionStorage.problemsDone){
    problems = JSON.parse(sessionStorage.problemsDone)
  }
  
  var found = false
  for (let index = 0; index < problems.length; index++) {
    const problem = problems[index];
    if(problem.id == id){
      found = true
      problems.splice(index, 1)
      index -= 1
    }
    
  }
  if (!found) problems.push(id)
  sessionStorage.problemsDone = JSON.stringify(problems)
  const inputP = document.getElementById('problemsToSubmit')
  inputP.value = JSON.stringify(sessionStorage.problemsDone)
}

const themeMap = {
  dark: "light",
  solar: "dark",
  light: "solar",
};

const theme = (localStorage.getItem('theme') == 'undefined' ? themeMap[0] : localStorage.getItem('theme'))
  || (tmp = Object.keys(themeMap)[0],
      localStorage.setItem('theme', tmp),
      tmp);

var bodyClass = undefined;

window.onload = function(){
  bodyClass = document.body.classList;
  bodyClass.add(theme);
  document.getElementById('themeButton').onclick = toggleTheme;
}

function toggleTheme() {
  const current = localStorage.getItem('theme');
  const next = themeMap[current];

  bodyClass.replace(current, next);
  localStorage.setItem('theme', next);
}
