function search (searchText, dropdownFilterText) {
  var dropdownFilter = (dropdownFilterText ? dropdownFilterText : document.getElementById('dropdownMenuButton').value).toUpperCase()
  
  var td, txtValue;
  
  var filter = searchText.toUpperCase().trim()
  var table = document.getElementById('problemTable')
  var tr = table.getElementsByTagName('tr')

  for (let index = 0; index < tr.length; index++) {
    td = tr[index].getElementsByTagName('td')[0]
    if (td) {
      txtValue = (td.textContent || td.innerText).toUpperCase()

      if (txtValue.includes(filter) && txtValue.includes(dropdownFilter)) {
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