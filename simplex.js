//Add the contains function to String
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

/**
 * Checks if the input variable is a LP equation
 *
 * Here's a  valid input example :
 * Maximize p = (1/2)x + 3y + z + 4w subject to
 * x + y + z + w <= 40
 * 2x + y - z - w >= 10
 * w - y >= 10
 *
 * and the expected output
 * maximizep=(1/2)x+3y+z+4wsubjecttox+y+z+w<=402x+y-z-w>=10w-y>=10
 *
 * The output shall be feed to the lpParser
 */
function checkInput(inputId){

  lpString = document.getElementById(inputId).value.toLowerCase();
  console.log(lpString);

  //Checks if we have a minimize or a maximize
  if(!lpString.contains("mini") && !lpString.contains("maxi")){
    alert("This isn't an LP.")
    return;
  }

  //Remove carriage return and spaces
  lpString = lpString.replace(/\s+/g, '').trim();

  return lpString;
}
