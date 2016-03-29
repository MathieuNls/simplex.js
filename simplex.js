//Add the contains function to String
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

var linearExpression;

/**
 * Checks if the input variable is a LP equation
 *
 * Here's a  valid input example :
 * Maximize p = 0.5x + 3y + z + 4w subject to
 * x + y + z + w <= 40
 * 2x + y - z - w <= 10
 * w - y <= 10
 *
 * The output shall be feed to the simplex algo
 */
function createTableau(inputId){

  lpString = document.getElementById(inputId).value.toLowerCase();
  console.log(lpString);

  //Checks if we have a minimize or a maximize
  if(!lpString.contains("mini") && !lpString.contains("maxi")){
    alert("This isn't an LP.")
    return;
  }

  linearExpression = new Tableau(lpString);

  console.log(linearExpression.toArray());
  linearExpression.showMatrix();

  simplex(linearExpression);

  return linearExpression;
}

// Given a column of identity matrix, find the row containing 1.
// return -1, if the column as not from an identity matrix.
function findBasisVariable(tab, col) {
  var i, xi=-1;
  for(i=1; i < tab.rows; i++) {

    if (tab.matrix[i][col] == 1) {

      if (xi == -1){
        xi=i;   // found first '1', save this row number.
      }else{
        return -1; // found second '1', not an identity matrix.
      }
    } else if (tab.matrix[i][col] != 0) {
      return -1; // not an identity matrix column.
    }
  }
  return xi;
}

function printOptimalVector(tab) {
  var j, xi;
  for(j=1;j<tab.columns;j++) { // for each column.
    xi = findBasisVariable(tab, j);
    if (xi != -1){
      console.log("x"+j+"="+tab.matrix[xi][0]);
    } else {
      console.log("x"+j+"=0");
    }
  }
}

// Find the pivot_row, with smallest positive ratio = col[0] / col[pivot]
function findPivotRow(tab, pivotCol) {
  var i, pivotRow = 0;
  var minRatio = -1;
  console.log("Ratios A[row_i,0]/A[row_i,"+pivotCol+"] = [");

  for(i=1;i<tab.rows;i++){
    var ratio = tab.matrix[i][0] / tab.matrix[i][pivotCol];
    if ( (ratio > 0  && ratio < minRatio ) || minRatio < 0 ) {
      minRatio = ratio;
      pivotRow = i;
    }
  }
  if (minRatio == -1){
    return -1; // Unbounded.
  }

  console.log("Found pivot A["+pivotRow+","+pivotCol+"], min positive ratio="+minRatio+" in row="+pivotRow+".");

  return pivotRow;
}

function findPivotColumn(tableau) {
  var j, pivot_col = 1;
  var lowest = tableau.matrix[0][pivot_col];
  for(j=1; j<tableau.columns; j++) {
    if (tableau.matrix[0][j] < lowest) {
      lowest = tableau.matrix[0][j];
      pivot_col = j;
    }
  }

  console.log("Most negative column in row[0] is col "+pivot_col+" = "+lowest+".");

  if( lowest >= 0 ) {
    // All positive columns in row[0], this is optimal.
    return -1;
  }
  return pivot_col;
}

function addSlackVariables(tableau){

  for(i=1; i<tableau.rows; i++) {
    for(j=1; j<tableau.rows; j++){
      tableau.matrix[i][j + tableau.columns -1] = (i==j);
    }
  }
  tableau.columns += tableau.rows -1;
}

function check_b_positive(tableau) {
  for(i=1; i<tableau.rows; i++){
    if(tableau.matrix[i][0] < 0){
      console.log("aie");
    }
  }
}

function pivotOn(tab, row, col) {
  var i, j;
  var pivot;

  pivot = tab.matrix[row][col];
  for(j=0;j<tab.columns;j++)
    tab.matrix[row][j] /= pivot;

    // foreach remaining row i do
  for(i=0; i<tab.rows; i++) {
    var multiplier = tab.matrix[i][col];
    if(i==row) {
      continue;
    }
    // r[i] = r[i] - z * r[row];
    for(j=0; j<tab.columns; j++) {
      tab.matrix[i][j] -= multiplier * tab.matrix[row][j];
    }
  }
}

function simplex(tableau){

  addSlackVariables(tableau);
  check_b_positive(tableau);
  console.log("Padded with slack variables");
  tableau.showMatrix();

  for (var i = 0; i < 30; i++) {

    var pivot_col, pivot_row;

    pivot_col = findPivotColumn(tableau);
    if( pivot_col < 0 ) {
      console.log("Found optimal value=A[0,0]="+tableau.matrix[0][0]+" (no negatives in row 0).");
      printOptimalVector(tableau);
      break;
    }

    console.log("Entering variable x"+pivot_col+" to be made basic, so pivot_col="+pivot_col+".");

    pivot_row = findPivotRow(tableau, pivot_col);
    if (pivot_row < 0) {
      console.log("unbounded (no pivot_row)");
      break;
    }
    console.log("Leaving variable x"+pivot_row+", so pivot_row="+pivot_row+".");

    pivotOn(tableau, pivot_row, pivot_col);
    console.log("After pivoting");
    tableau.showMatrix();
    printOptimalVector(tableau);
  }
}

/**
 * Create a Tableau given a linearString
 */
function Tableau(linearString){

  var linearStringSplitted = linearString.split(" subject to");

  this.variables = extractVariables(linearStringSplitted[0].split("=")[1]);

  this.constantes = extractConstantes(this.variables, linearStringSplitted[1].split("\n"));

  this.objective = new Constraint(this.variables, extractCoefficientedVariables(linearStringSplitted[0].split("=")[1].trim()), "eq", "=", 0.0);

  this.rows = this.constantes.length + 1;
  this.columns = this.variables.length + 1;
  this.matrix = [];
  this.matrix[0] = this.objective.toArray(true);
  for(var i = 0; i < this.constantes.length; i++){
    this.matrix[i+1] = this.constantes[i].toArray();
  }

  this.showMatrix = function(){
    for (var i = 0; i < this.matrix.length; i++) {
      console.log(this.matrix[i]);
    }
  }

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

/**
 * Extract all the variables inside a String
 * @param  String equation
 * @return Array
 */
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

/**
 * Extracts the constantes
 * @param  variables
 * @param  constanteEquations
 * @return [Constraint]
 */
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

/**
 * Creates a new Constraint
 * @param  variables
 * @param  coefVariables
 * @param  op
 * @param  string
 * @param  rightHand
 */
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

  this.toArray = function(reverse){
    var array = [];
    array[0] = this.rightHand;
    for(var i = 0; i < variables.length; i++){
      array[i+1] = (reverse == true) ? this[this.variables[i]] * -1 : this[this.variables[i]];

    }
    return array;
  }
}

/**
 * Extracts variables and coefficient from equation
 * @param  equation
 * @return
 */
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
