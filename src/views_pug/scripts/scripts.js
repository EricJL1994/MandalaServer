function search () {
  var td, txtValue;

  var filter = document.getElementById('problemSearch').value.toUpperCase().trim()
  var table = document.getElementById('problemTable')
  var tr = table.getElementsByTagName('tr')

  for (let index = 0; index < tr.length; index++) {
    td = tr[index].getElementsByTagName('td')[0]
    if (td) {
      txtValue = td.textContent || td.innerText

      if (txtValue.toUpperCase().includes(filter)) {
        tr[index].style.display = ''
      } else {
        tr[index].style.display = 'none'
      }
    }
  }

}