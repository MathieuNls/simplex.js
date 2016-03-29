//Add the contains function to String
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

var linearExpression;

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

  linearExpression = new Tableau(lpString);

  console.log(linearExpression.toArray());

  return lpString;
}

function Tableau(linearString){

  var linearStringSplitted = linearString.split(" subject to");

  this.variables = extractVariables(linearStringSplitted[0].split("=")[1]);

  this.constantes = extractConstantes(this.variables, linearStringSplitted[1].split("\n"));

  this.objective = new Constraint(this.variables, extractCoefficientedVariables(linearStringSplitted[0].split("=")[1]), "eq", "=", 0.0);

  this.toArray = function(){
    var array = [];
    array[0] = this.constantes.length + 1;
    array[1] = this.variables.length + 1;
    array[2] = this.objective.toArray();
    for(var i = 0; i < this.constantes.length; i++){
      array[i+3] = this.constantes[i].toArray();
    }
    return array;
  }
}

function extractVariables(equation){

  var re = /([a-z]+)/g;
  var m;
  var variables = [];
  var count = 0;

  while ((m = re.exec(equation)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }

      variables[count++] = m[0];
  }
  return variables;

}

function extractConstantes(variables, constanteEquations){

  var constantes = [];
  var constCount = 0;

  for(var i = 0; i < constanteEquations.length; i++){


    var op = undefined;
    var string = "";

    if(constanteEquations[i].indexOf(">=") != -1){
      op = "gteq";
      string = ">=";
    }else if(constanteEquations[i].indexOf("<=") != -1){
      op = "lteq";
      string = "<=";
    }else if(constanteEquations[i].indexOf(">") != -1){
      op = "gt";
      string = ">";
    }else if(constanteEquations[i].indexOf("<") != -1){
      op = "lt";
      string = "<";
    }else if(constanteEquations[i].indexOf("=") != -1){
      op = "eq";
      string = "=";
    }

    if(op != undefined){
      splittedConstante = constanteEquations[i].split(string);
      rightHand = splittedConstante[1].replace(' ', '');

      var extractedVariables = extractCoefficientedVariables(splittedConstante[0]);
      constantes[constCount] = new Constraint(variables, extractedVariables, op, string, rightHand);

      console.log(constantes[constCount].toArray());
      constCount++;
    }
  }

  return constantes;
}

function Constraint(variables, coefVariables, op, string, rightHand){

  for(var i = 0; i < variables.length; i++){
    this[variables[i]] = 0.0;
  }

  for(var y = 0; y < coefVariables.length; y++){
    this[coefVariables[y].variable] = parseFloat(coefVariables[y].coefficient);
  }

  this.variables = variables;
  this.op = op;
  this.string = string;
  this.rightHand = parseFloat(rightHand);

  this.toArray = function(){
    var array = [];
    array[0] = this.rightHand;
    for(var i = 0; i < variables.length; i++){
      array[i+1] = this[this.variables[i]];
    }
    return array;
  }
}

function extractCoefficientedVariables(equation){
  var re = /(\-\s|\+\s)?(([0-9]+(.[0-9]+)?)?)([a-z]+)/g;
  var m;
  var variables = [];
  var count = 0;

  while ((m = re.exec(equation)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      console.log(m);

      variables[count] = {
        sign: (m[1] == undefined) ? "+" : m[1].replace(' ', ''),
        coefficient: (m[2] == "") ? 1 : m[2],
        variable:m[5]
      };

      if(variables[count].sign == "-"){
       variables[count].coefficient *= -1;
      }

      count++;
  }
  return variables;
}
