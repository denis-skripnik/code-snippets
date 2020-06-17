'  Изменение значений чисел ячеек определённого столбца
Sub Main
  Dim inc, row As Integer
  Dim rows, col As Integer
  Dim x As Object
  
  inc = 5.84  ' На сколько делить число
  rows = 1094 ' Количество просматриваемых строк
  col = 4   ' Номер столбца для увеличения значений
  
  oDoc = ThisComponent
  row = 10
  Do While (row < rows)
    x = oDoc.Sheets(0).getCellByPosition(col, row) ' Первая страница текущего элемента (индекс 0)
    
    '  Проверка типа ячейки
    Select Case x.Type
      ' Если число
      Case com.sun.star.table.CellContentType.VALUE
        oDoc.Sheets(0).getCellByPosition(col, row).setValue(x.Value / inc)
      ' Если текст
      'Case com.sun.star.table.CellContentType.TEXT
      ' Если пусто
      'Case com.sun.star.table.CellContentType.EMPTY
      ' Если формула
      'Case com.sun.star.table.CellContentType.FORMULA
        
    End Select
    
    row = row + 1
  Loop
End Sub