var houses = []; // Array para armazenar nomes das casas cadastradas
var saldoPorCasa = {}; // Inicializa saldoPorCasa como um objeto vazio
var totalPNL = 0; // Variável para armazenar o PNL total

// Função para exibir a seção "Adicionar Nova Bet"
function showAddBet() {
  var addBetSection = document.getElementById("dashboard");
  addBetSection.style.transform = "translateX(0%)"; // Mostra a seção movendo-a para a posição inicial (0%)
}

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}


// Inicialmente abre a guia DASHBOARD
document.getElementsByClassName("tablink")[0].click();

// Função para adicionar uma casa nas listas suspensas
function addHouse() {
  var newHouseName = document.getElementById("newHouse").value;
  if (newHouseName) {
    houses.push(newHouseName);
    saldoPorCasa[newHouseName] = 0; // Inicializa o saldo da nova casa como 0
    updateHouseDropdowns(); // Atualiza as listas suspensas
    updateSaldoList(); // Atualiza a lista de saldos
    document.getElementById("newHouse").value = ""; // Limpa o campo de adicionar casa
  }
}

// Função para atualizar a lista de saldos por casa
function updateSaldoList() {
  var saldoList = document.getElementById("saldoList");
  saldoList.innerHTML = "";
  for (var casa in saldoPorCasa) {
    var li = document.createElement("li");
    li.textContent = casa + ": R$ " + saldoPorCasa[casa].toFixed(2); // Fixando em 2 casas decimais

    // Criar o botão de exclusão
    var btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.setAttribute("data-casa", casa); // Definir o atributo de dados com o nome da casa
    btnExcluir.addEventListener("click", function () {
      var casaParaExcluir = this.getAttribute("data-casa");
      delete saldoPorCasa[casaParaExcluir]; // Excluir a casa do objeto saldoPorCasa
      updateSaldoList(); // Atualizar a lista de saldos
      updateHouseDropdowns(); // Atualizar as listas suspensas
    });

    // Adicionar o botão de exclusão à lista
    li.appendChild(btnExcluir);

    // Adicionar o item da casa com o botão de exclusão à lista de saldos
    saldoList.appendChild(li);
  }
}

// Função para atualizar as listas suspensas com as casas cadastradas
function updateHouseDropdowns() {
  var casaDropdowns = document.querySelectorAll("#casa1, #casa2, #selectedHouse");
  casaDropdowns.forEach(function (dropdown) {
    dropdown.innerHTML = '<option value="">Selecione uma casa</option>'; // Limpa as opções anteriores
    houses.forEach(function (casa) {
      // Verificar se a casa está presente no objeto saldoPorCasa
      if (saldoPorCasa[casa] !== undefined) {
        var option = document.createElement("option");
        option.text = casa;
        option.value = casa;
        dropdown.add(option);
      }
    });
  });
}

// Função para atualizar o saldo na guia Dashboard
function updateDashboardSaldo() {
  var saldoElements = document.querySelectorAll(".saldo-dashboard");
  saldoElements.forEach(function (element) {
    var casa = element.dataset.casa;
    if (saldoPorCasa[casa] !== undefined) {
      element.textContent = "R$ " + saldoPorCasa[casa].toFixed(2); // Fixando em 2 casas decimais
    }
  });
}

// Função para atualizar o saldo na guia Área Técnica
function updateTecnicaSaldo() {
  updateSaldoList(); // Atualiza a lista de saldos
}

// Função de depósito
function deposit() {
  var depositAmount = parseFloat(document.getElementById("depositAmount").value);
  var selectedHouse = document.getElementById("selectedHouse").value;
  if (!isNaN(depositAmount) && depositAmount > 0 && selectedHouse) {
    if (saldoPorCasa[selectedHouse] !== undefined) {
      saldoPorCasa[selectedHouse] += depositAmount;
      updateDashboardSaldo(); // Atualizar a exibição do saldo na guia Dashboard
      updateTecnicaSaldo(); // Atualizar a exibição do saldo na guia Área Técnica
      document.getElementById("depositAmount").value = ""; // Limpar o campo de depósito
    } else {
      alert("Casa não encontrada!");
    }
  } else {
    alert("Por favor, insira um valor válido e selecione uma casa.");
  }

  // Atualizar as listas suspensas
  updateHouseDropdowns();
}

// Função de saque
function withdraw() {
  var withdrawAmount = parseFloat(document.getElementById("withdrawAmount").value);
  var selectedHouse = document.getElementById("selectedHouse").value;
  if (!isNaN(withdrawAmount) && withdrawAmount > 0 && selectedHouse) {
    if (saldoPorCasa[selectedHouse] !== undefined && saldoPorCasa[selectedHouse] >= withdrawAmount) {
      saldoPorCasa[selectedHouse] -= withdrawAmount;
      updateDashboardSaldo(); // Atualizar a exibição do saldo na guia Dashboard
      updateTecnicaSaldo(); // Atualizar a exibição do saldo na guia Área Técnica
      document.getElementById("withdrawAmount").value = ""; // Limpar o campo de saque
    } else {
      alert("Saldo insuficiente ou casa não encontrada!");
    }
  } else {
    alert("Por favor, insira um valor válido e selecione uma casa.");
  }

  // Atualizar as listas suspensas
  updateHouseDropdowns();
}

// Função para filtrar a tabela com base no status selecionado
function filterByStatus() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  const activeRadio = document.querySelector('input[name="status-filter"]:checked');
  const activeLabel = document.querySelector(`label[for="${activeRadio.id}"]`);
  activeLabel.classList.add('active');
  var filter = document.querySelector('input[name="status-filter"]:checked').value;
  var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
  var rows = table.getElementsByTagName('tr');

  for (var i = 0; i < rows.length; i++) {
    var status = rows[i].getElementsByTagName('td')[rows[i].getElementsByTagName('td').length - 1].getElementsByTagName('select')[0].value;
    if (filter === "todos" || status === filter) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

// Chama a função calculateResults() sempre que um checkbox é clicado
document.addEventListener('change', function (event) {
  if (event.target.type === 'checkbox') {
    calculateResults();
    updateTotalPNLDisplay();
  }
});

function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  if (sidebar.style.transform === "translateX(0%)") {
    sidebar.style.transform = "translateX(100%)"; // Oculta o sidebar
  } else {
    sidebar.style.transform = "translateX(0%)"; // Exibe o sidebar
  }
}

// Função para alternar a exibição da seção "Nova Bet" na guia Dashboard
function toggleDashboardContent() {
  var dashboard = document.getElementById("dashboard");
  var toggleButton = document.getElementById("toggleButton");
  var elementsToHide = dashboard.querySelectorAll("#newbet, #bet-form");

  elementsToHide.forEach(function (element) {
    if (element.style.display === "none") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });

  if (toggleButton.textContent === "Manual") {
    toggleButton.textContent = "Ocultar";
  } else {
    toggleButton.textContent = "Manual";
  }
}

// Função para ordenar a tabela por data
function sortTableByDate(tableId) {
  var table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  var rows = Array.prototype.slice.call(table.rows);
  console.log()
  rows.sort(function (a, b) {
    var dateA = new Date(a.cells[8].textContent);
    var dateB = new Date(b.cells[8].textContent);
    return dateA - dateB;
  });
  console.log()
  rows.forEach(function (row) {
    table.appendChild(row);
  });
  console.log()
}

// Função para calcular e atualizar os indicadores na área técnica
function updateTechnicalIndicators() {
  var saldoTotal = saldoList;
  var lucroLiquido = "Lucro Líquido" + 0;
  var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
  var rows = table.getElementsByTagName('tr');

  // Calcula o saldo total e o lucro líquido (soma do PNL)
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var pnl = parseFloat(row.cells[10].textContent);
    lucroLiquido = totalPNL;
  }

  // Calcula a porcentagem de ganho de lucro em relação ao saldo
  var saldoTotalPercentage = saldoTotal / (saldoTotal - lucroLiquido) * 100;

  // Atualiza os campos indicadores na área técnica
  // document.getElementById("saldoTotal").textContent = "Saldo Total R$ " + saldoTotal.toFixed(2);
  document.getElementById("lucroLiquido").textContent = "Lucro Líquido R$ " + totalPNL.toFixed(2);
  document.getElementById("porcentagemLucro").textContent = saldoTotalPercentage.toFixed(2) + "%";
}

// Chama a função updateTechnicalIndicators() sempre que houver uma alteração na tabela
document.addEventListener('change', function (event) {
  if (event.target.type === 'checkbox') {
    calculateResults();
    updateTotalPNLDisplay();
    updateTechnicalIndicators();
  }
});

// Chama a função updateTechnicalIndicators() quando a página é carregada
window.addEventListener('load', function (event) {
  updateTechnicalIndicators();
});

function showCodePopup() {
  document.getElementById("codePopup").style.display = "block";
}

function closeCodePopup() {
  document.getElementById("codePopup").style.display = "none";
  document.getElementById("codeInput").value = "";
}

function submitCode() {
  var code = document.getElementById("codeInput").value;
  var { valores1, valores2 } = processCode(code); // Capturando os valores retornados pela função
  closeCodePopup();
  console.log("valores1:", valores1); // Agora valores1 está definido neste escopo
  console.log("valores2:", valores2); // Agora valores2 está definido neste escopo
}

function activateRadioButton(id) {
  document.getElementById(id).checked = true;
  filterByStatus();
}

////////////////////////////////////////////////////////////////////////////////////////

// Função para adicionar uma aposta
function addBet() {
  var casa1 = document.getElementById("casa1").value;
  var valor1 = parseFloat(document.getElementById("valor1").value);
  var casa2 = document.getElementById("casa2").value;
  var valor2 = parseFloat(document.getElementById("valor2").value);
  var odd1 = parseFloat(document.getElementById("odd1").value);
  var odd2 = parseFloat(document.getElementById("odd2").value);
  var partida = document.getElementById("partida").value;
  var dataHora = document.getElementById("data").value;

  db.collection("bets").add({
    casa1: casa1,
    valor1: valor1,
    odd1: odd1,
    casa2: casa2,
    valor2: valor2,
    odd2: odd2,
    partida: partida,
    data: dataHora,
    status: "pendente"
  })
    .then((docRef) => {
      console.log("Aposta adicionada com ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Erro ao adicionar aposta: ", error);
    });

  if (!isNaN(valor1) && !isNaN(valor2) && !isNaN(odd1) && !isNaN(odd2) && casa1 && casa2 && partida && dataHora) {
    if (saldoPorCasa[casa1] !== undefined && saldoPorCasa[casa2] !== undefined) {
      if (saldoPorCasa[casa1] >= valor1 && saldoPorCasa[casa2] >= valor2) {
        saldoPorCasa[casa1] -= valor1;
        saldoPorCasa[casa2] -= valor2;
        updateDashboardSaldo();
        updateTecnicaSaldo();

        var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        newRow.insertCell().textContent = casa1;
        newRow.insertCell().textContent = "R$" + valor1.toFixed(2);
        newRow.insertCell().textContent = odd1.toFixed(2);
        newRow.insertCell().textContent = casa2;
        newRow.insertCell().textContent = "R$" + valor2.toFixed(2);
        newRow.insertCell().textContent = odd2.toFixed(2);
        var winnerCell = newRow.insertCell();
        var winnerCheckbox1 = document.createElement("input");
        winnerCheckbox1.type = "checkbox";
        winnerCheckbox1.name = "winner" + table.rows.length;
        winnerCheckbox1.value = casa1;
        winnerCheckbox1.onchange = function () { updateWinner(docRef.id); };
        var winnerCheckbox2 = document.createElement("input");
        winnerCheckbox2.type = "checkbox";
        winnerCheckbox2.name = "winner" + table.rows.length;
        winnerCheckbox2.value = casa2;
        winnerCheckbox2.onchange = function () { updateWinner(docRef.id); };
        winnerCell.appendChild(winnerCheckbox1);
        winnerCell.appendChild(document.createTextNode(casa1));
        winnerCell.appendChild(document.createElement("br"));
        winnerCell.appendChild(winnerCheckbox2);
        winnerCell.appendChild(document.createTextNode(casa2));
        newRow.insertCell().textContent = partida;
        newRow.insertCell().textContent = new Date(dataHora).toLocaleString();

        // Adiciona colunas Result1, Result2 e PNL
        newRow.insertCell().textContent = "-"; // Result1
        newRow.insertCell().textContent = "-"; // Result2
        newRow.insertCell().textContent = "-"; // PNL

        var deleteButtonCell = newRow.insertCell();
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Excluir";
        deleteButton.onclick = function () {
          var row = this.parentNode.parentNode;
          var pnl = parseFloat(row.cells[11].textContent);
          if (!isNaN(pnl)) {
            totalPNL -= pnl;
            updateTotalPNLDisplay();
          }
          row.parentNode.removeChild(row);
        };
        deleteButtonCell.appendChild(deleteButton);

        // Inserindo a lista suspensa para o status na última célula
        var statusCell = newRow.insertCell();
        var statusSelect = document.createElement("select");
        var uniqueId = "statusSelect_" + table.rows.length; // Criando um ID único
        statusSelect.id = uniqueId; // Atribuindo o ID único ao elemento select
        statusSelect.innerHTML = `
          <option value="pendente">Pendente</option>
          <option value="resolvido">Resolvido</option>
        `;
        statusSelect.value = "pendente"; // Define o valor inicial como "Pendente"
        statusSelect.onchange = filterByStatus; // Chama a função de filtragem ao alterar o status
        statusCell.appendChild(statusSelect);

        document.getElementById("casa1").value = "";
        document.getElementById("valor1").value = "";
        document.getElementById("casa2").value = "";
        document.getElementById("valor2").value = "";
        document.getElementById("odd1").value = "";
        document.getElementById("odd2").value = "";
        document.getElementById("partida").value = "";
        document.getElementById("data").value = "";

        alert("Aposta adicionada com sucesso!");

        sortTableByDate("dashboard-table");

        calculateResults(); // Atualiza os resultados e o PNL após adicionar uma nova aposta
        updateTotalPNLDisplay(); // Atualiza a exibição do PNL total
        loadBets(); // Recarrega a tabela após deletar a aposta

        // Filtrar novamente após adicionar uma nova aposta
        filterByStatus();
      } else {
        alert("Saldo insuficiente em uma ou ambas as casas.");
      }
    } else {
      alert("Uma ou ambas as casas não existem.");
    }
  } else {
    alert("Por favor, preencha todos os campos obrigatórios com valores válidos.");
  }
}

function updateWinner(id) {
  var vencedor = [];

  // Encontrar os checkboxes marcados para o ID especificado
  var winnerCheckbox1 = document.querySelector(`input[name="winner1-${id}"]:checked`);
  var winnerCheckbox2 = document.querySelector(`input[name="winner2-${id}"]:checked`);

  // Adicionar os vencedores aos arrays
  if (winnerCheckbox1) {
    vencedor.push(winnerCheckbox1.value);
  }
  if (winnerCheckbox2) {
    vencedor.push(winnerCheckbox2.value);
  }

  // Atualizar o vencedor no banco de dados
  db.collection("bets").doc(id).update({ vencedor: vencedor })
    .then(() => {
      console.log("Vencedor atualizado com sucesso!");
      loadBets(); // Recarrega a tabela após atualizar o vencedor
    })
    .catch((error) => {
      console.error("Erro ao atualizar vencedor: ", error);
    });
}


// Modifique a função addBetFromCode de maneira similar para incluir o onchange nos checkboxes de vencedor
function addBetFromCode(casa1, valor1, odd1, casa2, valor2, odd2, partida, dataHora) {
  if (saldoPorCasa[casa1] !== undefined && saldoPorCasa[casa2] !== undefined) {
    if (saldoPorCasa[casa1] >= valor1 && saldoPorCasa[casa2] >= valor2) {
      saldoPorCasa[casa1] -= valor1;
      saldoPorCasa[casa2] -= valor2;
      updateDashboardSaldo();
      updateTecnicaSaldo();

      db.collection("bets").add({
        casa1: casa1,
        valor1: valor1,
        odd1: odd1,
        casa2: casa2,
        valor2: valor2,
        odd2: odd2,
        partida: partida,
        data: dataHora,
        status: "pendente"
      })
        .then((docRef) => {
          console.log("Aposta adicionada com ID: ", docRef.id);

          var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
          var newRow = table.insertRow();
          newRow.insertCell().textContent = casa1;
          newRow.insertCell().textContent = "R$" + valor1.toFixed(2);
          newRow.insertCell().textContent = odd1.toFixed(2);
          newRow.insertCell().textContent = casa2;
          newRow.insertCell().textContent = "R$" + valor2.toFixed(2);
          newRow.insertCell().textContent = odd2.toFixed(2);
          var winnerCell = newRow.insertCell();
          var winnerCheckbox1 = document.createElement("input");
          winnerCheckbox1.type = "checkbox";
          winnerCheckbox1.name = "winner" + table.rows.length;
          winnerCheckbox1.value = casa1;
          winnerCheckbox1.onchange = function () { updateWinner(docRef.id); };
          var winnerCheckbox2 = document.createElement("input");
          winnerCheckbox2.type = "checkbox";
          winnerCheckbox2.name = "winner" + table.rows.length;
          winnerCheckbox2.value = casa2;
          winnerCheckbox2.onchange = function () { updateWinner(docRef.id); };
          winnerCell.appendChild(winnerCheckbox1);
          winnerCell.appendChild(document.createTextNode(casa1));
          winnerCell.appendChild(document.createElement("br"));
          winnerCell.appendChild(winnerCheckbox2);
          winnerCell.appendChild(document.createTextNode(casa2));
          newRow.insertCell().textContent = partida;
          newRow.insertCell().textContent = new Date(dataHora).toLocaleString();

          // Adiciona colunas Result1, Result2 e PNL
          newRow.insertCell().textContent = "-"; // Result1
          newRow.insertCell().textContent = "-"; // Result2
          newRow.insertCell().textContent = "-"; // PNL

          var deleteButtonCell = newRow.insertCell();
          var deleteButton = document.createElement("button");
          deleteButton.textContent = "Excluir";
          deleteButton.onclick = function () {
            var row = this.parentNode.parentNode;
            var pnl = parseFloat(row.cells[11].textContent);
            if (!isNaN(pnl)) {
              totalPNL -= pnl;
              updateTotalPNLDisplay();
            }
            row.parentNode.removeChild(row);
          };
          deleteButtonCell.appendChild(deleteButton);

          // Inserindo a lista suspensa para o status na última célula
          var statusCell = newRow.insertCell();
          var statusSelect = document.createElement("select");
          var uniqueId = "statusSelect_" + table.rows.length; // Criando um ID único
          statusSelect.id = uniqueId; // Atribuindo o ID único ao elemento select
          statusSelect.innerHTML = `
          <option value="pendente">Pendente</option>
          <option value="resolvido">Resolvido</option>
        `;
          statusSelect.value = "pendente"; // Define o valor inicial como "Pendente"
          statusSelect.onchange = filterByStatus; // Chama a função de filtragem ao alterar o status
          statusCell.appendChild(statusSelect);

          alert("Aposta adicionada com sucesso!");

          sortTableByDate("dashboard-table");

          calculateResults(); // Atualiza os resultados e o PNL após adicionar uma nova aposta
          updateTotalPNLDisplay(); // Atualiza a exibição do PNL total
          loadBets(); // Recarrega a tabela após deletar a aposta

          // Filtrar novamente após adicionar uma nova aposta
          filterByStatus();
        })
        .catch((error) => {
          console.error("Erro ao adicionar aposta: ", error);
        });
    } else {
      alert("Saldo insuficiente em uma ou ambas as casas.");
    }
  } else {
    alert("Uma ou ambas as casas não existem.");
  }
}

// Função para calcular os resultados e atualizar o PNL
function calculateResults() {
  var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
  var rows = table.getElementsByTagName('tr');
  var totalPNL = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var casa1 = row.cells[0].textContent;
    var valor1 = parseFloat(row.cells[1].textContent.replace("R$", "").trim());
    var odd1 = parseFloat(row.cells[2].textContent.trim());
    var casa2 = row.cells[3].textContent;
    var valor2 = parseFloat(row.cells[4].textContent.replace("R$", "").trim());
    var odd2 = parseFloat(row.cells[5].textContent.trim());
    var checkboxes = row.cells[6].getElementsByTagName('input');
    var pnlCell = row.cells[11];

    if (checkboxes[0].checked && !checkboxes[1].checked) {
      var resultado1 = valor1 * odd1 - valor1;
      var resultado2 = -valor2;
      pnlCell.textContent = "R$" + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$" + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$" + resultado2.toFixed(2); // Atualiza Result2
    } else if (!checkboxes[0].checked && checkboxes[1].checked) {
      var resultado1 = -valor1;
      var resultado2 = valor2 * odd2 - valor2;
      pnlCell.textContent = "R$" + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$" + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$" + resultado2.toFixed(2); // Atualiza Result2
    } else if (checkboxes[0].checked && checkboxes[1].checked) {
      var resultado1 = valor1 * odd1 - valor1;
      var resultado2 = valor2 * odd2 - valor2;
      pnlCell.textContent = "R$" + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$" + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$" + resultado2.toFixed(2); // Atualiza Result2
    } else {
      var resultado1 = -valor1;
      var resultado2 = -valor2;
      pnlCell.textContent = "R$0.00";
      row.cells[9].textContent = "R$" + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$" + resultado2.toFixed(2); // Atualiza Result2
    }

    var pnl = parseFloat(pnlCell.textContent.replace("R$", "").trim());
    if (!isNaN(pnl)) {
      totalPNL += pnl;
    }
  }

  // Atualiza a exibição do PNL total
  updateTotalPNLDisplay(totalPNL);
}

// Função para atualizar a exibição do PNL total
function updateTotalPNLDisplay(totalPNL) {
  document.getElementById("totalPNL").textContent = "Lucro: R$ " + totalPNL.toFixed(2);
}


function processCode(code) {
  var lines = code.split(/\r?\n/); // Dividindo o texto em linhas
  if (lines.length >= 4) { // Verificando se há pelo menos 4 linhas no código
    var dataPartida = lines[0].split(/\t/); // Dividindo os itens da primeira linha pelo separador de tabulação
    var dataHora = dataPartida[0].trim(); // O primeiro item é a data
    var partida = dataPartida.slice(1).reverse().join(" ➜ ").trim(); // Os itens restantes formam a partida, unidos pelo separador "➜"
    var casa1 = lines[1].split("\t"); // A segunda linha contém a primeira casa, dividida por tabulação
    var valores1 = lines[1].split("\t"); // A segunda linha contém os valores para a primeira casa, divididos por tabulação
    var odd1 = lines[1].split("\t"); // A segunda linha contém os valores para a segunda casa, divididos por tabulação
    var casa2 = lines[2].split("\t"); // A terceira linha contém a segunda casa, dividida por tabulação
    var valores2 = lines[2].split("\t"); // A terceira linha contém os valores para a segunda casa, divididos por tabulação
    var odd2 = lines[2].split("\t"); // A terceira linha contém os valores para a segunda casa, divididos por tabulação

    if (valores1.length >= 8 && valores2.length >= 8) { // Verificando se há pelo menos 8 valores em cada linha
      var casa1 = valores1[0].trim(); // A primeira posição contém a casa 1
      var odd1 = parseFloat(valores1[2].trim()); // A terceira posição contém a odd 1
      var valor1 = parseFloat(valores1[5].trim()); // A sexta posição contém o valor 1

      var casa2 = valores2[0].trim(); // A primeira posição contém a casa 2
      var odd2 = parseFloat(valores2[2].trim()); // A terceira posição contém a odd 2
      var valor2 = parseFloat(valores2[5].trim()); // A sexta posição contém o valor 2

      addBetFromCode(casa1, valor1, odd1, casa2, valor2, odd2, partida, dataHora); // Chamando a função para adicionar a aposta
    } else {
      alert("O código está incompleto ou mal formatado."); // Alerta se o código estiver incompleto ou mal formatado
    }
  } else {
    alert("O código está incompleto ou mal formatado."); // Alerta se o código estiver incompleto ou mal formatado
  }
  return { valores1, valores2 }; // Retornando valores1 e valores2
}

function loadBets() {
  db.collection("bets").get().then((querySnapshot) => {
    var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Limpa a tabela antes de recarregar os dados

    querySnapshot.forEach((doc) => {
      const bet = doc.data();
      var newRow = table.insertRow();
      newRow.insertCell().textContent = bet.casa1;
      newRow.insertCell().textContent = "R$" + bet.valor1.toFixed(2);
      newRow.insertCell().textContent = bet.odd1.toFixed(2);
      newRow.insertCell().textContent = bet.casa2;
      newRow.insertCell().textContent = "R$" + bet.valor2.toFixed(2);
      newRow.insertCell().textContent = bet.odd2.toFixed(2);

      var winnerCell = newRow.insertCell();
      var winnerCheckbox1 = document.createElement("input");
      winnerCheckbox1.type = "checkbox";
      winnerCheckbox1.name = `winner1-${doc.id}`;
      winnerCheckbox1.value = bet.casa1;
      winnerCheckbox1.checked = bet.vencedor === bet.casa1 || (Array.isArray(bet.vencedor) && bet.vencedor.includes(bet.casa1));
      winnerCheckbox1.onchange = function () {
        updateWinner(doc.id);
      };
      var winnerCheckbox2 = document.createElement("input");
      winnerCheckbox2.type = "checkbox";
      winnerCheckbox2.name = `winner2-${doc.id}`;
      winnerCheckbox2.value = bet.casa2;
      winnerCheckbox2.checked = bet.vencedor === bet.casa2 || (Array.isArray(bet.vencedor) && bet.vencedor.includes(bet.casa2));
      winnerCheckbox2.onchange = function () {
        updateWinner(doc.id);
      };
      winnerCell.appendChild(winnerCheckbox1);
      winnerCell.appendChild(document.createTextNode(bet.casa1));
      winnerCell.appendChild(document.createElement("br"));
      winnerCell.appendChild(winnerCheckbox2);
      winnerCell.appendChild(document.createTextNode(bet.casa2));

      newRow.insertCell().textContent = bet.partida;
      newRow.insertCell().textContent = new Date(bet.data).toLocaleString();

      var result1Cell = newRow.insertCell();
      var result2Cell = newRow.insertCell();
      var pnlCell = newRow.insertCell();
      result1Cell.textContent = bet.result1 ? bet.result1.toFixed(2) : "-";
      result2Cell.textContent = bet.result2 ? bet.result2.toFixed(2) : "-";
      pnlCell.textContent = bet.pnl ? bet.pnl.toFixed(2) : "-";

      var deleteButtonCell = newRow.insertCell();
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Excluir";
      deleteButton.onclick = function () {
        deleteBet(doc.id);
      };
      deleteButtonCell.appendChild(deleteButton);

      var statusCell = newRow.insertCell();
      var statusSelect = document.createElement("select");
      statusSelect.innerHTML = `
        <option value="pendente">Pendente</option>
        <option value="resolvido">Resolvido</option>
      `;
      statusSelect.value = bet.status;
      statusSelect.onchange = function () {
        updateStatus(doc.id, statusSelect.value);
      };
      statusCell.appendChild(statusSelect);
    });
    filterByStatus();
    calculateResults();
    updateTotalPNLDisplay();
  });
}

function updateStatus(id, status) {
  db.collection("bets").doc(id).update({ status: status })
    .then(() => {
      console.log("Status atualizado com sucesso!");
      loadBets();
    })
    .catch((error) => {
      console.error("Erro ao atualizar status: ", error);
    });
}

function deleteBet(id) {
  db.collection("bets").doc(id).delete().then(() => {
    console.log("Aposta deletada com sucesso!");
  }).catch((error) => {
    console.error("Erro ao deletar aposta: ", error);
  });
  loadBets(); // Recarrega a tabela após deletar a aposta
}

document.addEventListener('DOMContentLoaded', loadBets);