// simplexMaximisation
function maximiserSimplex(nbDec, nbContr) {
  $("#valeursInput").hide();

  var resultats = obtenirValeurs(nbDec, nbContr);
  resultats.push(obtenirValeursFonction(nbDec, nbContr));

  var tableauFinal = [];

  var compteurTableau = 0;

  var iterMax = parseInt($("#iterMax").val()) || 20;

  console.log(iterMax);

  var valeursB = [];

  var variables = initialiserVariables(nbDec, nbContr);
  var variablesInitiales = variables[0];
  var typesVariables = variables[1];

  var nbColonnes = nbDec + nbContr + 1;
  var nbLignes = nbContr + 1;

  for (let i = 0; i < nbLignes; i++) {
    console.log(resultats[i][nbColonnes - 1]);
    valeursB.push(resultats[i][nbColonnes - 1]);
  }

  convertirMatrice(resultats, "Initial", typesVariables, variablesInitiales, nbLignes, tableauFinal, 0);
  compteurTableau++;

  do {
    var infoColonne = trouverColonneMin(resultats, nbLignes, nbColonnes);
    var valeurMin = infoColonne[0];
    if (valeurMin === 0) {
      break;
    }
    var colonneMin = infoColonne[1];

    var resultatSortie = choisirSortie(resultats, colonneMin, nbColonnes, nbLignes, variablesInitiales);
    variablesInitiales = resultatSortie[1];
    var lignePivot = resultatSortie[0];
    var colonnePivot = colonneMin;
    var valeurPivot = resultats[lignePivot][colonnePivot];
    resultats = diviserLignePivot(resultats, nbColonnes, lignePivot, valeurPivot);
    resultats = annulerElementsColonne(resultats, lignePivot, colonnePivot, nbLignes, nbColonnes);

    var valeursZ = resultats[nbLignes - 1];

    var positifNegatif = valeursZ.some(v => v < 0);

    compteurTableau++;

    if (compteurTableau === iterMax || compteurTableau === 3) {
      break;
    }

    if (positifNegatif) {
      convertirMatrice(resultats, "Partiel" + compteurTableau, typesVariables, variablesInitiales, nbLignes, tableauFinal, compteurTableau);
    }
  } while (positifNegatif);

  convertirMatrice(resultats, "Final", typesVariables, variablesInitiales, nbLignes, tableauFinal, compteurTableau);
  $(".affichages").append(
    '<br><div class="row" align="center" ><button type="button" id="boutonAfficher" class="btn btn-primary" onclick="cacherAfficher()">Cacher Tableau</button></div>'
  );

  afficherResultats(resultats, nbDec, nbContr, nbColonnes, variablesInitiales);
}

function initialiserVariables(nbDec, nbContr) {
  var base = ["Z"];
  for (let i = 1; i <= nbContr; i++) {
      base.push("E" + i);  // Changed from R to E
  }

  var tete = ["Base"];
  for (let i = 1; i <= nbDec; i++) {
      tete.push("X" + i);
  }
  for (let i = 1; i <= nbContr; i++) {
      tete.push("E" + i);  // Changed from R to E
  }
  tete.push("=");

  return [base, tete];
}


function obtenirValeurs(nbDec, nbContr) {
  var valeurs = [];
  for (let i = 1; i <= nbContr; i++) {
    var ligne = [];
    for (let j = 1; j <= nbDec; j++) {
      var val = parseFloat($(`input[name='X${j}_res${i}']`).val()) || 0;
      ligne.push(val);
    }
    for (let j = 1; j <= nbContr; j++) {
      ligne.push(i === j ? 1 : 0);
    }
    var b = parseFloat($(`input[name='valRestriction${i}']`).val()) || 0;
    ligne.push(b);
    valeurs.push(ligne);
  }
  return valeurs;
}

function obtenirValeursFonction(nbDec, nbContr) {
  var fonctionZ = [];
  for (let i = 1; i <= nbDec; i++) {
    var val = parseFloat($(`input[name='valX${i}']`).val()) || 0;
    fonctionZ.push(-val); // Assuming maximization
  }
  for (let i = 0; i <= nbContr; i++) {
    fonctionZ.push(0);
  }
  return fonctionZ;
}

function convertirMatrice(matrice, nomDiv, tete, base, nbLignes, tableauFinal, aux) {
  var html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr>`;
  for (let i = 0; i < tete.length; i++) {
    html += `<th>${tete[i]}</th>`;
  }
  html += `</tr></thead><tbody>`;
  for (let i = 0; i < nbLignes; i++) {
    html += `<tr><td>${base[i]}</td>`;
    for (let j = 0; j < matrice[i].length; j++) {
      html += `<td>${matrice[i][j].toFixed(2)}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></div>`;
  $("#resultats").append(html);
}

function trouverColonneMin(matrice, nbLignes, nbColonnes) {
  var rowIndex = nbLignes - 1;
  var min = matrice[rowIndex][0];
  var columnIndex = 0;
  for (let j = 1; j < nbColonnes - 1; j++) {
    if (matrice[rowIndex][j] < min) {
      min = matrice[rowIndex][j];
      columnIndex = j;
    }
  }
  return [min, columnIndex];
}

function choisirSortie(matrice, colonneMin, nbColonnes, nbLignes, variablesInitiales) {
  var minRatio = Infinity;
  var minRow = -1;
  for (let i = 0; i < nbLignes - 1; i++) {
    if (matrice[i][colonneMin] > 0) {
      var ratio = matrice[i][nbColonnes - 1] / matrice[i][colonneMin];
      if (ratio < minRatio) {
        minRatio = ratio;
        minRow = i;
      }
    }
  }
  if (minRow !== -1) {
    variablesInitiales[minRow] = "X" + (colonneMin + 1);
  }
  return [minRow, variablesInitiales];
}

function diviserLignePivot(matrice, nbColonnes, lignePivot, valeurPivot) {
  for (let j = 0; j < nbColonnes; j++) {
    matrice[lignePivot][j] /= valeurPivot;
  }
  return matrice;
}

function annulerElementsColonne(matrice, lignePivot, colonnePivot, nbLignes, nbColonnes) {
  for (let i = 0; i < nbLignes; i++) {
    if (i !== lignePivot) {
      let ratio = matrice[i][colonnePivot];
      for (let j = 0; j < nbColonnes; j++) {
        matrice[i][j] -= ratio * matrice[lignePivot][j];
      }
    }
  }
  return matrice;
}

function afficherResultats(matrice, nbDec, nbContr, nbColonnes, variablesInitiales) {
  var zValue = matrice[nbLignes - 1][nbColonnes - 1];
  $("#resultats").append(`<div>The optimal solution is Z = ${zValue.toFixed(2)}</div><br>`);
  $("#resultats").append("<div> Basic Variables </div>");
  for (let i = 0; i < nbContr; i++) {
    var baseName = variablesInitiales[i];
    var baseValue = matrice[i][nbColonnes - 1];
    $("#resultats").append(`<div>${baseName} = ${baseValue.toFixed(2)}</div>`);
  }
}

function cacherAfficher() {
  var tableau = $("#resultats");
  if (tableau.is(":visible")) {
    tableau.hide();
    $("#boutonAfficher").text('Afficher Tableau');
  } else {
    tableau.show();
    $("#boutonAfficher").text('Cacher Tableau');
  }
}
