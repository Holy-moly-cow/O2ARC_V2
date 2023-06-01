$(document).ready(function () {
    var initialToolMode = 'edit';
    handleToolModeChange(initialToolMode);

    $('input[name=tool_switching]').change(function() {
        var selectedToolMode = $(this).val();
        handleToolModeChange(selectedToolMode);
    });

    $('#select_util_btn').on('click', 'button' , function() {
        var buttonName = $(this).attr('id'); // 버튼의 이름을 가져옴
        console.log(buttonName); // 버튼의 이름을 콘솔에 출력
    });

    cell_observer()

})

function cell_observer(cells, observer) {
  // Select the cell_final elements and create a new MutationObserver object
  var cells = document.querySelectorAll('#user_interact .cell_final');
  const rows = document.querySelectorAll('#user_interact .row')
  const rownum = rows.length
  const divnum = cells.length
  var observer = new MutationObserver(function(mutations) {
    var changedElements = [];
    var radioButtons = document.querySelectorAll('input[name="tool_switching"]');
    var labels = document.querySelectorAll('label[for^="tool_"]');

    // Find the selected radio button
    var selectedRadioButton = document.querySelector('input[name="tool_switching"]:checked');

    // Find the corresponding label for the selected radio button
    var selectedLabel = document.querySelector('label[for="' + selectedRadioButton.id + '"]');

    // Retrieve the label text
    var labelText = selectedLabel.textContent;

    // Log the selected label text
    var inputValue = $("#output_grid_size").val();
    var rows = parseInt(inputValue.split('x')[0]);
    var cols = parseInt(inputValue.split('x')[1]);
          
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        var oldClasses = getSymbolClasses(mutation.oldValue.split(' '));
        var newClasses = getSymbolClasses($(mutation.target).attr('class').split(' '));

        var classChanges = getSymbolClassChanges(oldClasses, newClasses);

        if (classChanges.length === 2) {
          changedElements.push(mutation.target);
        }
      }
    });

    if (changedElements.length > 0) {

      const numbersArray = [];
      for (let i = 0; i < rownum; i++) {
        const rowArray = [];
      
        for (let j = 0; j < divnum/rownum; j++) {
          const index = i * 5 + j;
          const div = cells[index];
      
          const className = div.className;
          const number = className.split('symbol_')[1]; // Extract the number after "symbol_"
          rowArray.push(parseInt(number)); // Convert the number to an integer and store it in the row array
        }
      
        numbersArray.push(rowArray); // Store the row array in the main array
      }
      
      console.log(numbersArray)
      console.log(labelText);
      sendLogData(numbersArray, labelText)

    }
  });
  // Start observing changes to the 'class' attribute of each cell_final element
  cells.forEach(function(cell) {
    observer.observe(cell, { attributes: true, attributeOldValue: true });
  });

}

function sendLogData(numbersArray, labelText){
  const currentURL = new URL(window.location.href);
  const pathnameSegments = currentURL.pathname.split('/');

  const dynamicParam1 = pathnameSegments[2]; 
  const dynamicParam2 = pathnameSegments[3];

  console.log(dynamicParam1); 
  console.log(dynamicParam2); 

  const url = `${encodeURIComponent(dynamicParam2)}/save-data`;
  console.log(url);
  
  fetch(url , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      numbersArray: numbersArray,
      labelText: labelText
    })
  })
    .then(function(response) {
      if (response.ok) {
        console.log('Data saved successfully.');
      } else {
        console.log('Failed to save data.');
      }
    })
    .catch(function(error) {
      console.log('Error:', error);
    });

}

function createArray(rows, columns) {
  const array = [];
  
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(0); // or any initial value you prefer
    }
    array.push(row);
  }
  
  return array;
}

// Radio Button : 'edit', 'select', floodfill'
function handleToolModeChange(toolMode) {
    if (toolMode == 'edit') {
      // 'edit' mode
      console.log("edit")
      disableTools();
      enableEditable();
    //   infoMsg('Editing mode activated');
    } else if (toolMode == 'select') {
      // 'select' mode
      console.log("select")
      disableTools();
      enableSelectable();
    //   infoMsg('Select some cells and click on a color to fill in, or press C to copy');
    } else if (toolMode == 'floodfill') {
      // 'flood fill' mode
      disableTools();
    //   enableFloodFill();
    //   infoMsg('Flood fill mode activated');
    } else {
    }
}

function enableEditable() {
    $('#symbol_picker').find('.symbol_preview').click(function(event) {
        pickSymbol();
    });
     // Find the user_interact cell div and add a click listener to it.
    $('#user_interact').on('click', '.cell_final', function(event) {
        var selectedPreview = $('#symbol_picker').find('.selected-symbol-preview');
        // Get the class of the clicked element.
        var currentClasses = $(this).attr('class').split(' ');
        $(this).removeClass(currentClasses[1]).addClass('symbol_'+selectedPreview.attr('symbol'));
    });
}

function enableSelectable() {
    $('#clockrotate').show();
    $('#counterclockrotate').show();
    $('#xflip').show();
    $('#yflip').show();

    $("#user_interact").selectable();   // get selectable
    $('#symbol_picker').find('.symbol_preview').click(function(event) {
        pickSymbol();   // pick symbol color
        fillSelected(); // fill selected cell_final
    });
}

function pickSymbol() {
    symbol_preview = $(event.target);
    $('#symbol_picker').find('.symbol_preview').each(function(i, preview) {
        $(preview).removeClass('selected-symbol-preview');
    })
    symbol_preview.addClass('selected-symbol-preview');
}

function fillSelected() {
    var selectedPreview = $('#symbol_picker').find('.selected-symbol-preview');
    // remove old color and add new color
    $('.cell_final.ui-selectee.ui-selected').each(function() {
        $(this).removeClass(function(index, className) {
          return (className.match(/(^|\s)symbol_\S+/g) || []).join(' ');
        });
        $(this).addClass('symbol_'+selectedPreview.attr('symbol'));
    });
}

function disableTools() {
    $('#clockrotate').hide();
    $('#counterclockrotate').hide();
    $('#xflip').hide();
    $('#yflip').hide();

    disableEditable();
    disableSelectable();
    // disableFloodFill();
}
    
function disableEditable() {
    $('#symbol_picker').find('.symbol_preview').off('click');
    $('#user_interact').off('click', '.cell_final');
}

function disableSelectable() {
    try {
        $("#user_interact").selectable("destroy");
    }
    catch (e) {
    }
}

// Function to extract symbol classes
function getSymbolClasses(classes) {
    var symbolClasses = [];
  
    classes.forEach(function(className) {
      if (className.startsWith('symbol_')) {
        symbolClasses.push(className);
      }
    });
  
    return symbolClasses;
}

// Function to compare old and new classes and identify changes
function getSymbolClassChanges(oldClasses, newClasses) {
    var classChanges = [];
  
    oldClasses.forEach(function(oldClass) {
      if (!newClasses.includes(oldClass)) {
        classChanges.push({ class: oldClass, oldClass: oldClass, newClass: '' });
      }
    });
  
    newClasses.forEach(function(newClass) {
      if (!oldClasses.includes(newClass)) {
        classChanges.push({ class: newClass, oldClass: '', newClass: newClass });
      }
    });
  
    return classChanges;
  }

function resetOutputGrid() {
    // Use jQuery to select all <div> elements with class "cell_final"
    // and update their class attribute
    $("#user_interact .cell_final").attr("class", "cell_final symbol_0");
    // Reapply the MutationObserver to the updated elements
    // Reapply the MutationObserver to the updated elements
    // cell_observer()
    
  }

$("#resetBtn").on("click", function() {
    // Call the resetOutputGrid() function when the button is clicked
    resetOutputGrid();
});

function resizeOutputGrid() {
    // Get the input value
    var inputValue = $("#output_grid_size").val();
    

    var rows = parseInt(inputValue.split('x')[0]);
    var cols = parseInt(inputValue.split('x')[1]);
    const numbersArray = createArray(rows, cols)

    if(rows>cols){
        n = rows
    } else {
        n = cols
    }
    var grid = document.getElementById('user_interact');
    grid.innerHTML = '';

    for (var i = 0; i < rows; i++) {
        var row = document.createElement('div');
        row.className = 'row justify-content-center';
        for (var j = 0; j < cols; j++) {
            var cell = document.createElement('div');
            cell.className = 'cell_final symbol_0';
            cell.style.width = (400 / n) + 'px';
            cell.style.height = (400 / n) + 'px';
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    // Log the input value to the console
    console.log("Input Value:", inputValue);
    sendLogData(numbersArray, 'Change Grid Size')

    cell_observer()

}

function copyFromInput() {

    console.log(testgrid[0][0])

    if(testgrid[0][0].height>testgrid[0][0].width){
        n = testgrid[0][0].height
    } else {
        n = testgrid[0][0].width
    }

    var userInteractDiv = document.getElementById("user_interact");
    

    userInteractDiv.innerHTML = "";

    for (var i = 0; i < testgrid[0][0].height; i++) {
        var rowDiv = document.createElement("div");
        rowDiv.className = "row justify-content-center";
        
        for (var j = 0; j < testgrid[0][0].width; j++) {
        var cellDiv = document.createElement("div");
        cellDiv.className = "cell_final symbol_" + testgrid[0][0].grid[i][j];
        cellDiv.style.width = (400 / n)+ "px"; // Set the desired width of each cell
        cellDiv.style.height = (400 / n)+ "px"; // Set the desired height of each cell
        
        rowDiv.appendChild(cellDiv);
        }
        
        userInteractDiv.appendChild(rowDiv);

    }

    cell_observer()

    
}

function compareArrays(array1, array2) {
  // Check if the arrays have the same number of rows
  if (array1.length !== array2.length) {
    return false;
  }

  // Check if the arrays have the same number of columns in each row
  for (let i = 0; i < array1.length; i++) {
    if (array1[i].length !== array2[i].length) {
      return false;
    }
  }

  // Iterate over the elements of the arrays
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array1[i].length; j++) {
      // Compare the elements at each index of the nested arrays
      if (array1[i][j] !== array2[i][j]) {
        return false;
      }
    }
  }

  // If all elements are equal, the arrays are identical
  return true;
}

function submitSolution(input, name, cRoute){
    // console.log("hi")

    const divs = document.querySelectorAll('#user_interact .cell_final');
    const rows = document.querySelectorAll('#user_interact .row')
    const rownum = rows.length
    const divnum = divs.length

    const numbersArray = [];
    for (let i = 0; i < rownum; i++) {
      const rowArray = [];
    
      for (let j = 0; j < divnum/rownum; j++) {
        const index = i * 5 + j;
        const div = divs[index];
    
        const className = div.className;
        const number = className.split('symbol_')[1]; // Extract the number after "symbol_"
        rowArray.push(parseInt(number)); // Store the number in the row array
      }
    
      numbersArray.push(rowArray); // Store the row array in the main array
    }

    User_Answer = numbersArray.map(num => parseInt(num))
    Actual_Answer = input[0][1].grid.flat().map(num => parseInt(num))

    console.log(numbersArray)

    for (let i = 0; i < input[0][1].grid.length; i++) {
      for (let j = 0; j < input[0][1].grid[i].length; j++) {
        // Convert the value to an integer using parseInt()
        input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
      }
    }
    console.log(input[0][1].grid)
    console.log(cRoute)
    var lastPart = cRoute.substring(cRoute.lastIndexOf('/') + 1);
    var incrementedValue = parseInt(lastPart, 10) + 1;
    
    // Convert the incremented value back to a string
    var incrementedLastPart = incrementedValue.toString();

    answer = compareArrays(numbersArray, input[0][1].grid)
    console.log(answer)
    if(answer){
        alert('Success!')
        window.location.href ="/task/" + name + '/' + incrementedLastPart
    } else {
        alert('Wrong!')
    }
    

}

function IQsubmitSolution(input, name, cRoute){
    // console.log("hi")

    const divs = document.querySelectorAll('#user_interact .cell_final');
    const rows = document.querySelectorAll('#user_interact .row')
    const rownum = rows.length
    const divnum = divs.length

    const numbersArray = [];
    for (let i = 0; i < rownum; i++) {
      const rowArray = [];
    
      for (let j = 0; j < divnum/rownum; j++) {
        const index = i * 5 + j;
        const div = divs[index];
    
        const className = div.className;
        const number = className.split('symbol_')[1]; // Extract the number after "symbol_"
        rowArray.push(parseInt(number)); // Store the number in the row array
      }
    
      numbersArray.push(rowArray); // Store the row array in the main array
    }

    User_Answer = numbersArray.map(num => parseInt(num))
    Actual_Answer = input[0][1].grid.flat().map(num => parseInt(num))

    console.log(numbersArray)

    for (let i = 0; i < input[0][1].grid.length; i++) {
      for (let j = 0; j < input[0][1].grid[i].length; j++) {
        // Convert the value to an integer using parseInt()
        input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
      }
    }

    //console.log(numbersArray)
    //console.log(input[0][0].grid)
    //console.log(input[0][1].grid.flat()) // 이 친구가 답임 ㅋㅋ
    console.log(cRoute)
    var lastPart = cRoute.substring(cRoute.lastIndexOf('/') + 1);
    var incrementedValue = parseInt(lastPart, 10) + 1;
    
    // Convert the incremented value back to a string
    var incrementedLastPart = incrementedValue.toString();
    
    console.log(User_Answer)
    console.log(Actual_Answer)
    answer = compareArrays(User_Answer, Actual_Answer)
    console.log(answer)
    if(answer){
        alert('Success!')
        window.location.href = incrementedLastPart
    } else {
        alert('Wrong!')
    }
    

}
  
  