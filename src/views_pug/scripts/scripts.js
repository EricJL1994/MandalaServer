function convertDateToTicks(date){
  var ticksPerMilisecond = 10000

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond
}

function start(input){
  input.type = "text";
  input.removeAttribute("src");
  document.getElementById('timeSearch').value = document.getElementById('timeValue').value
  search(input.value)
}

function search (searchText, dropdownFilterText, timeFilterText) {
  var dropdownFilter = (dropdownFilterText ? dropdownFilterText : document.getElementById('dropdownMenuButton').value).toUpperCase()
  var timeFilter = parseInt(timeFilterText ? timeFilterText : document.getElementById('timeValue').value)

  var d
  if (timeFilter > 0) {
    d = new Date()
    d.setDate(d.getDate()-timeFilter - 1)
  }

  var td, timetd, txtValue;

  var filter = searchText.toUpperCase().trim()
  var table = document.getElementById('problemTable')
  var tr = table.getElementsByTagName('tr')

  for (let index = 1; index < tr.length; index++) {
    td = tr[index].getElementsByTagName('td')[0]
    timetd = tr[index].getElementsByTagName('td')[2]

    if (td) {
      txtValue = (td.textContent || td.innerText).toUpperCase()
      if (txtValue.includes(filter) && txtValue.includes(dropdownFilter) && (d ? parseInt(timetd.textContent) >= convertDateToTicks(d) : true)) {
        tr[index].style.display = ''
      } else {
        tr[index].style.display = 'none'
      }
    }
  }
}

function filter (dropdownFilter) {
  var dropdown = document.getElementById('dropdownMenuButton')
  if (!dropdownFilter) {
    dropdown.innerText = 'Dificultad'
    dropdown.value = ''
  } else {
    dropdown.innerText = document.getElementById(dropdownFilter).textContent
    dropdown.value = dropdownFilter
  }

  search(document.getElementById('problemSearch').value + '', dropdown.value)
}

function timer(timeFilter){
  document.getElementById('timeValue').value = timeFilter
  search(document.getElementById('problemSearch').value + '', undefined, timeFilter)
}