// Important variables
var currentSymbol; // Current symbol being tested
var testedAll; // Tested each symbol at least once already

// Get all the HTML objects
body = document.getElementById("body");
giantColorChangingThing = document.getElementById("giantColorChangingThing");
colorForm = document.getElementById("colorForm");
colorPicker = document.getElementById("color");
dontPerceiveForm = document.getElementById("dontPerceiveForm");

textBox = document.getElementById("textBox");
textOutputBox = document.getElementById("textOutput");



// Event listeners
if (dontPerceiveForm != null) {
  dontPerceiveForm.addEventListener("click", dontPerceive);
}
if (textBox != null) {
  textBox.addEventListener("keydown", typing);
}

// Clear storage function for debug purposes
// clearStorage();

// Set up the first question for the testing page
var currStatus = localStorage.getItem("currStatus");
currStatus = JSON.parse(currStatus);
if (currStatus == null) {
  currentSymbol = "A";
} else {
  currentSymbol = currStatus[0];
}
if (giantColorChangingThing != null) {
  giantColorChangingThing.innerHTML = "<p>" + currentSymbol + "</p>";
}

// Add unfinished text from previous session into result page
if (textBox != null) {
  var ancientTexts = localStorage.getItem("text");
  if (ancientTexts != null) {
    textBox.innerHTML = ancientTexts;
  }
}

function changeColor(){
  // Graphics if user is selecting colors on test page.
  // TODO: make this change in real time, instead of after the user clicks out.
  var colorPicked = colorPicker.value;
  giantColorChangingThing.style = "color:" + colorPicked;
}

function dontPerceive(){
  // Graphics if user clicks "I don't perceive this in a color" on test page.
  var dontPerceive = document.getElementById("dontPerceive").checked;
  if (dontPerceive) {
    giantColorChangingThing.style = "color: black";
  }
}

function answered(){
  // Called when user presses "Done" button on test page.
  console.log("answered!");

  // Store data into JSON
  colorJSON = {
    "color": colorPicker.value,
    "dontPerceive": document.getElementById("dontPerceive").checked,
  }

  // Gather ancient data from localStorage
  var currStatus = localStorage.getItem("currStatus");
  if (typeof(currStatus) == "undefined" || currStatus == null) {
    currentSymbol = "A";
    testedAll = false;
    currStatus = [currentSymbol, testedAll];
  } else {
    currStatus = JSON.parse(currStatus);
    currentSymbol = currStatus[0];
    testedAll = currStatus[1];
  }

  var ancientColorData = localStorage.getItem(currentSymbol);
  if (typeof(ancientColorData) == "undefined" || ancientColorData == null) {
    // Rather modern
    ancientColorData = [];
  } else {
    ancientColorData = JSON.parse(ancientColorData);
  }
  ancientColorData.push(colorJSON);
  localStorage.setItem(currentSymbol, JSON.stringify(ancientColorData));


  // Change to another letter
  if (!testedAll) {
    // If we haven't tested every symbol at least once, we want to do that first
    var keyCode = currentSymbol.charCodeAt(0);
    currentSymbol = String.fromCharCode(keyCode+1);
    giantColorChangingThing.innerHTML = "<p>" + currentSymbol + "</p>";
    if (currentSymbol == "Z") {
      testedAll = true;
    }
  } else {
    // We've tested everything already, so now all that's left is
    // refining the exact colors of random symbols
    var random = Math.random();
    random = Math.floor(26*random + 65);
    if (random > 90){
      random = 90;
    }
    currentSymbol = String.fromCharCode(random);
    giantColorChangingThing.innerHTML = "<p>" + currentSymbol + "</p>";
  }
  console.log(currStatus);

  // Save all data into localStorage
  currStatus[0] = currentSymbol;
  currStatus[1] = testedAll;
  localStorage.setItem("currStatus", JSON.stringify(currStatus));

}

function clearStorage(){
  // Uh, clears the storage
  if (!confirm("This action will permanently erase all of the data you have \
  entered into this page. Are you sure you want to continue?")) {
    // Gives a pop-up asking for confirmation
    return;
  }

  localStorage.removeItem("currStatus");
  localStorage.removeItem("text");
  var alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";
  var i = alphabet.length; // 26
  while (i--) {
    localStorage.removeItem(alphabet[i]);
  }
  console.log("STORAGE CLEARED");
}


function colorWords(){
  var textInput = textBox.value;
  var textOutput = "<p contenteditable>";

  // Loop through each character in input string and change its color
  for (var i = 0; i < textInput.length; i++) {
    letter = textInput.charAt(i);
    if (65 <= letter.toUpperCase().charCodeAt(0) <= 90) {
      // Is a capital letter
      var color = averageColorOf(letter.toUpperCase());
      if (color != null) {
        textOutput += "<span style=color:" + color + ">" + letter + "</span>";
        console.log("Coloring is fun");
        console.log("Colored " + letter + " to " + color);
      } else {
        textOutput += letter;
        console.log("No color data for letter " + letter);
      }
    } else {
      textOutput += letter;
    }
  }
  textOutput += "</p>"

  // Display colored words in lower textbox
  textOutputBox.innerHTML = textOutput;
}

function averageColorOf(letter){
  // Finds the average color of a letter given all the past data of it.
  var colorData = localStorage.getItem(letter);
  colorData = JSON.parse(colorData);
  if (colorData == null) {
    return "#000000";
  }

  // Start summing things up
  var r = 0;
  var g = 0;
  var b = 0;
  var numTerms = 0;
  for (var i = 0; i < colorData.length; i++) {
    var colorJSON = colorData[i];
    var hexColor = colorJSON['color'];
    var dontPerceive = colorJSON['dontPerceive'];
    if (dontPerceive) {
      continue;
    }

    console.log(colorJSON);
    console.log(hexColor);
    var rgb = hexToRgb(hexColor);
    r += rgb.r;
    g += rgb.g;
    b += rgb.b;
    numTerms ++;
  }

  console.log("AVERAGE: " + rgbToHex(Math.floor(r/numTerms), Math.floor(g/numTerms), Math.floor(b/numTerms)));
  return rgbToHex(Math.floor(r/numTerms), Math.floor(g/numTerms), Math.floor(b/numTerms));
}


//\\ Warning, functions copied from Stack Overflow ahead //\\
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
//\\ Stack Overflow code ends here //\\

function typing(){
  // Runs when the user types in the text box, to save unfinished text for the next session.
  var textInput = textBox.value;
  localStorage.setItem("text", textInput);
}
