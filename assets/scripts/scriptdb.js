var houses = []; // Array para armazenar nomes das casas cadastradas
var saldoPorCasa = {}; // Inicializa saldoPorCasa como um objeto vazio
var totalPNL = 0; // Variável para armazenar o PNL total

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log("Usuário está autenticado:", user.uid);
    loadBets();
    generatePieChart();
  } else {
    console.log("Usuário não está autenticado");
    window.location.href = "/login.html";
  }
});

// Adicione esta função para recarregar o saldoList após o login ou recarga da página
function updateSaldoListOnAuthChange() {
  const user = firebase.auth().currentUser;
  if (user) {
    updateSaldoList();
    updateStatus();
    loadBets();
  }
}

// Chame esta função sempre que o estado de autenticação do usuário mudar
firebase.auth().onAuthStateChanged(updateSaldoListOnAuthChange);

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
  //updateSaldoList();
  updateSaldoList();
  generatePieChart();
  renderChart();
  loadBets();
  sortTableByDate("dashboard-table");
}

// Inicialmente abre a guia DASHBOARD
document.getElementsByClassName("tablink")[0].click();


////////////////////////////////////////////////////////////////////////////////////////

function addHouse() {
  var notyf = new Notyf(); // Inicializa o Notyf
  var newHouseName = document.getElementById("newHouse").value;
  if (newHouseName) {
    const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
    const houseRef = db.collection("users").doc(userId).collection("houses").doc(newHouseName);

    houseRef.get().then((doc) => {
      if (doc.exists) {
        // A casa já existe, exibe uma notificação de erro na tela
        notyf.error("A casa já existe");
      } else {
        // A casa não existe, adicione-a
        houseRef.set({
          saldo: 0
        }).then(() => {
          updateSaldoList(); // Atualiza a lista de saldos
          document.getElementById("newHouse").value = ""; // Limpa o campo de adicionar casa
          // Exibe uma notificação de sucesso na tela
          notyf.success("Casa adicionada com sucesso!");
        }).catch((error) => {
          console.error("Erro ao adicionar casa: ", error);
          document.getElementById("newHouse").value = ""; // Limpa o campo de adicionar casa
          // Exibe uma notificação de erro na tela
          notyf.error("Erro ao adicionar casa. Por favor, tente novamente.");
        });
      }
    }).catch((error) => {
      console.error("Erro ao verificar a existência da casa: ", error);
      // Exibe uma notificação de erro na tela
      notyf.error("Erro ao verificar a existência da casa. Por favor, tente novamente. Verifique se o nome está");
    });
  } else {
    // Exibe uma notificação de erro na tela se o campo estiver vazio
    notyf.error("Por favor, insira o nome da nova casa.");
  }
}

function excluirCasa(casaParaExcluir, userId) {
  return db.collection("users").doc(userId).collection("houses").doc(casaParaExcluir).delete();
}

function updateSaldoList() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var saldoList = document.getElementById("saldoList");
  saldoList.innerHTML = ""; // Limpa a lista antes de adicionar novos itens
  db.collection("users").doc(userId).collection("houses").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var casa = doc.id;
      var saldo = doc.data().saldo;
      var li = document.createElement("li");
      li.textContent = casa + ": R$ " + saldo.toFixed(2); // Fixando em 2 casas decimais

      // Criar o botão de exclusão
      var btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.setAttribute("data-casa", casa); // Definir o atributo de dados com o nome da casa
      btnExcluir.addEventListener("click", function () {
        var casaParaExcluir = this.getAttribute("data-casa");
        excluirCasa(casaParaExcluir, userId)
          .then(() => {
            // Atualizar a lista de saldos após a exclusão
            updateSaldoList();
          })
          .catch((error) => {
            console.error("Erro ao excluir casa: ", error);
          });
      });

      // Adicionar o botão de exclusão à lista
      li.appendChild(btnExcluir);

      // Adicionar o item da casa com o botão de exclusão à lista de saldos
      saldoList.appendChild(li);
    });
  }).catch((error) => {
    console.error("Erro ao obter saldos: ", error);
  });
  updateHouseDropdowns(); // Atualizar as listas suspensas
  updateTechnicalIndicators();
}


function updateHouseDropdowns() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var casaDropdowns = document.querySelectorAll("#casa1, #casa2, #selectedHouse");
  casaDropdowns.forEach(function (dropdown) {
    dropdown.innerHTML = '<option value="">Selecione uma casa</option>'; // Limpa as opções anteriores
    db.collection("users").doc(userId).collection("houses").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var casa = doc.id;
        var option = document.createElement("option");
        option.text = casa;
        option.value = casa;
        dropdown.add(option);
      });
    }).catch((error) => {
      console.error("Erro ao obter casas: ", error);
    });
  });
}

function updateDashboardSaldo() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  db.collection("users").doc(userId).collection("houses").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var casa = doc.id;
      var saldo = doc.data().saldo;
      var saldoElements = document.querySelectorAll(`.saldo-dashboard[data-casa="${casa}"]`);
      saldoElements.forEach(function (element) {
        element.textContent = "R$ " + saldo.toFixed(2); // Fixando em 2 casas decimais
      });
    });
  }).catch((error) => {
    console.error("Erro ao atualizar o saldo do dashboard: ", error);
  });
  updateHouseDropdowns(); // Atualizar as listas suspensas
  updateSaldoList(); // Atualiza a lista de saldos
}

function deposit() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var notyf = new Notyf(); // Inicializa o Notyf
  var depositAmount = parseFloat(document.getElementById("depositAmount").value);
  var selectedHouse = document.getElementById("selectedHouse").value;

  if (!isNaN(depositAmount) && depositAmount > 0 && selectedHouse) {
    var houseRef = db.collection("users").doc(userId).collection("houses").doc(selectedHouse);

    houseRef.get().then((doc) => {
      if (doc.exists) {
        var newSaldo = doc.data().saldo + depositAmount;

        houseRef.update({ saldo: newSaldo }).then(() => {
          document.getElementById("depositAmount").value = ""; // Limpar o campo de depósito
          // Exibir uma notificação de sucesso na tela
          notyf.success("Depósito realizado com sucesso!");
        }).catch((error) => {
          console.error("Erro ao atualizar saldo: ", error);
          // Exibir uma notificação de erro na tela
          notyf.error("Erro ao atualizar saldo. Por favor, tente novamente.");
        });
      } else {
        // Exibir uma notificação de erro na tela se a casa não for encontrada
        notyf.error("Casa não encontrada!");
      }
      updateSaldoList(); // Atualiza a lista de saldos
      generatePieChart();
    }).catch((error) => {
      console.error("Erro ao obter saldo da casa: ", error);
      // Exibir uma notificação de erro na tela
      notyf.error("Erro ao obter saldo da casa. Por favor, tente novamente.");
    });
  } else {
    // Exibir uma notificação de erro na tela se os dados inseridos forem inválidos
    notyf.error("Por favor, insira um valor válido e selecione uma casa.");
  }
}

function withdraw() {
  var notyf = new Notyf(); // Inicializa o Notyf
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var withdrawAmount = parseFloat(document.getElementById("withdrawAmount").value);
  var selectedHouse = document.getElementById("selectedHouse").value;
  if (!isNaN(withdrawAmount) && withdrawAmount > 0 && selectedHouse) {
    var houseRef = db.collection("users").doc(userId).collection("houses").doc(selectedHouse);
    houseRef.get().then((doc) => {
      if (doc.exists) {
        if (doc.data().saldo >= withdrawAmount) {
          var newSaldo = doc.data().saldo - withdrawAmount;
          houseRef.update({ saldo: newSaldo }).then(() => {
            document.getElementById("withdrawAmount").value = ""; // Limpar o campo de saque
            // Exibir uma notificação de sucesso na tela
            notyf.success("Saque realizado com sucesso!");
          }).catch((error) => {
            console.error("Erro ao atualizar saldo: ", error);
            // Exibir uma notificação de erro na tela
            notyf.error("Erro ao atualizar saldo. Por favor, tente novamente.");
          });
        } else {
          // Exibir uma notificação de erro na tela se o saldo for insuficiente
          notyf.error("Saldo insuficiente!");
        }
      } else {
        // Exibir uma notificação de erro na tela se a casa não for encontrada
        notyf.error("Casa não encontrada!");
      }
      updateSaldoList(); // Atualiza a lista de saldos
      generatePieChart();
    }).catch((error) => {
      console.error("Erro ao obter saldo da casa: ", error);
      // Exibir uma notificação de erro na tela
      notyf.error("Erro ao obter saldo da casa. Por favor, tente novamente.");
    });
  } else {
    // Exibir uma notificação de erro na tela se os dados inseridos forem inválidos
    notyf.error("Por favor, insira um valor válido e selecione uma casa.");
  }
}

////////////////////////////////////////////////////////////////////////////////////////

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
    generatePieChart();
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
  console.log("Iniciando a ordenação da tabela por data...");

  // Obtém o tbody da tabela
  const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  if (!table) {
    console.error("Tabela ou tbody não encontrado.");
    return;
  }

  // Converte as linhas da tabela em um array
  const rows = Array.prototype.slice.call(table.rows);
  if (rows.length === 0) {
    console.error("Nenhuma linha encontrada na tabela.");
    return;
  }

  // Função para converter a data no formato "dd/mm/yyyy, HH:MM:SS" para um objeto Date
  function parseDate(dateString) {
    const parts = dateString.split(', ');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Mês é baseado em zero no objeto Date
    const year = parseInt(dateParts[2], 10);
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    return new Date(year, month, day, hours, minutes, seconds);
  }

  // Ordena as linhas com base na data
  rows.sort(function (a, b) {
    const dateA = parseDate(a.cells[8].textContent.trim());
    const dateB = parseDate(b.cells[8].textContent.trim());

    if (isNaN(dateA) || isNaN(dateB)) {
      console.warn(`Data inválida encontrada: ${dateA} ou ${dateB}`);
      return 0;
    }

    return dateA - dateB;
  });

  // Adiciona as linhas ordenadas de volta ao tbody
  rows.forEach(function (row) {
    table.appendChild(row);
  });

  console.log("Tabela ordenada por data com sucesso.");
}

async function updateTechnicalIndicators() {
  try {
    // Obter o UID do usuário autenticado
    const userId = firebase.auth().currentUser.uid;

    // Referência à coleção "bets" do usuário
    const betsRef = db.collection("users").doc(userId).collection("bets");

    // Inicializar o total de apostas pendentes
    let totalApostasPendentes = 0;

    // Buscar todos os documentos na coleção "bets"
    const snapshot = await betsRef.get();

    // Verificar se existem documentos
    if (snapshot.empty) {
      console.error("Nenhuma aposta encontrada");
    } else {
      // Calcular o total de apostas pendentes
      snapshot.forEach(doc => {
        const data = doc.data();
        // Verificar se a aposta está pendente
        if (data.status === "pendente") {
          // Se sim, somar os valores de "valor1" e "valor2"
          if (data.valor1) {
            totalApostasPendentes += parseFloat(data.valor1) || 0;
          }
          if (data.valor2) {
            totalApostasPendentes += parseFloat(data.valor2) || 0;
          }
        }
      });
    }

    // Inicializar o saldo total
    let saldoTotal = 0;
    // Buscar todos os documentos na coleção "houses"
    const housesSnapshot = await db.collection("users").doc(userId).collection("houses").get();

    // Verificar se existem documentos
    if (housesSnapshot.empty) {
      console.error("Nenhuma casa encontrada");
    } else {
      // Somar o saldo de todas as casas
      housesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.saldo) {
          saldoTotal += parseFloat(data.saldo) || 0;
        }
      });
    }

    // Inicializar o lucro líquido
    let lucroLiquido = 0;
    const table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');

    // Calcula o lucro líquido (soma do PNL)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pnlCell = row.cells[11]; // Célula que contém o valor do lucro
      const pnl = parseFloat(pnlCell.textContent.replace("R$ ", "").trim()); // Remover "R$" e converter para float
      if (!isNaN(pnl)) {
        lucroLiquido += pnl;
      }
    }

    // Atualiza a variável global totalPNL com o lucro líquido calculado
    totalPNL = lucroLiquido;

    const saldoTotalPercentage = (lucroLiquido / saldoTotal) * 100;

    // Atualiza os campos indicadores na área técnica
    const total = saldoTotal + totalApostasPendentes;
    document.getElementById("saldoTotal").textContent = "Saldo Total: R$ " + total.toFixed(2); // CRIAR FUNÇÃO QUE SE O VENCEDOR 1 VENCER = -VALOR1 E VICE-VERSA
    document.getElementById("lucroLiquido").textContent = "Lucro: R$ " + lucroLiquido.toFixed(2);
    document.getElementById("porcentagemLucro").textContent = "Lucro em %: " + saldoTotalPercentage.toFixed(2) + "%";

    // Atualiza o elemento HTML com o total de apostas pendentes
    document.getElementById("totalApostasPendentes").textContent = "Valor total retido em Bet: R$ " + totalApostasPendentes.toFixed(2);
  } catch (error) {
    console.error("Erro ao atualizar os indicadores:", error);
  }
}

// Chamar a função para atualizar os indicadores
updateTechnicalIndicators();

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
  Swal.fire({
    title: 'Insira o código',
    input: 'textarea',
    inputAttributes: {
      'aria-label': 'Insira o código aqui'
    },
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const code = Swal.getPopup().querySelector('textarea').value;
      if (!code) {
        Swal.showValidationMessage('Por favor, insira seu código');
        return false;
      }
      return code;
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      submitCode(result.value);
    }
  });
}

function closeCodePopup() {
  Swal.close();
}

function submitCode(code) {
  var { valores1, valores2 } = processCode(code); // Capturando os valores retornados pela função
  closeCodePopup();
}


function activateRadioButton(id) {
  document.getElementById(id).checked = true;
  filterByStatus();
  loadBets();
}

////////////////////////////////////////////////////////////////////////////////////////

function loadBets() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado

  db.collection("users").doc(userId).collection("bets").get().then((querySnapshot) => {
    var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Limpa a tabela antes de recarregar os dados

    querySnapshot.forEach((doc) => {
      const bet = doc.data();
      var newRow = table.insertRow();
      newRow.id = doc.id;
      newRow.insertCell().textContent = bet.casa1;
      newRow.insertCell().textContent = "R$ " + bet.valor1.toFixed(2);
      newRow.insertCell().textContent = bet.odd1.toFixed(3);
      newRow.insertCell().textContent = bet.casa2;
      newRow.insertCell().textContent = "R$ " + bet.valor2.toFixed(2);
      newRow.insertCell().textContent = bet.odd2.toFixed(3);

      var winnerCell = newRow.insertCell();
      var winnerCheckbox1 = document.createElement("input");
      winnerCheckbox1.type = "checkbox";
      winnerCheckbox1.name = `winner1-${doc.id}`;
      winnerCheckbox1.id = "winnerCheckbox1";
      winnerCheckbox1.value = bet.casa1;
      winnerCheckbox1.checked = bet.vencedor === bet.casa1 || (Array.isArray(bet.vencedor) && bet.vencedor.includes(bet.casa1));
      winnerCheckbox1.onchange = function () {
        updateWinner(doc.id, 'casa1');
      };
      var winnerCheckbox2 = document.createElement("input");
      winnerCheckbox2.type = "checkbox";
      winnerCheckbox2.name = `winner2-${doc.id}`;
      winnerCheckbox2.id = "winnerCheckbox2";
      winnerCheckbox2.value = bet.casa2;
      winnerCheckbox2.checked = bet.vencedor === bet.casa2 || (Array.isArray(bet.vencedor) && bet.vencedor.includes(bet.casa2));
      winnerCheckbox2.onchange = function () {
        updateWinner(doc.id, 'casa2');
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
        applyFadeoutAnimation(newRow, statusSelect.value);
        updateStatus(doc.id, statusSelect.value);
      };
      statusCell.appendChild(statusSelect);
    });
    sortTableByDate("dashboard-table");
    filterByStatus();
    calculateResults();
    updateTotalPNLDisplay();
  }).catch((error) => {
    console.error("Erro ao carregar apostas: ", error);
  });
}

function updateWinner(id, casa) {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var vencedor = [];

  // Encontrar os checkboxes para o ID especificado
  var winnerCheckbox1 = document.querySelector(`input[name="winner1-${id}"]`);
  var winnerCheckbox2 = document.querySelector(`input[name="winner2-${id}"]`);

  // Adicionar os vencedores aos arrays
  if (winnerCheckbox1 && winnerCheckbox1.checked) {
    vencedor.push(winnerCheckbox1.value);
  }
  if (winnerCheckbox2 && winnerCheckbox2.checked) {
    vencedor.push(winnerCheckbox2.value);
  }

  // Atualizar o vencedor no banco de dados na coleção de apostas do usuário autenticado
  db.collection("users").doc(userId).collection("bets").doc(id).update({ vencedor: vencedor })
    .then(() => {
      console.log("Vencedor atualizado com sucesso!");

      db.collection("users").doc(userId).collection("bets").doc(id).get()
        .then((doc) => {
          if (doc.exists) {
            const bet = doc.data();

            // Função para atualizar o saldo de uma casa
            const atualizarSaldo = (casa, resultado) => {
              const houseRef = db.collection("users").doc(userId).collection("houses").doc(casa);
              houseRef.get().then((houseDoc) => {
                if (houseDoc.exists) {
                  console.log(`Resultado para ${casa}: ${resultado}`);
                  const novoSaldo = houseDoc.data().saldo + resultado;
                  console.log(`Novo saldo para ${casa}: ${novoSaldo}`);
                  houseRef.update({ saldo: novoSaldo }).then(() => {
                    console.log(`Saldo da casa ${casa} atualizado com sucesso!`);
                  }).catch((error) => {
                    console.error(`Erro ao atualizar saldo da casa ${casa}: `, error);
                  });
                }
              }).catch((error) => {
                console.error(`Erro ao obter dados da casa ${casa}: `, error);
              });
            };

            const casa1 = bet.casa1;
            const casa2 = bet.casa2;
            const valor1 = bet.valor1;
            const valor2 = bet.valor1;
            const result1 = bet.valor1 * bet.odd1;
            const result2 = bet.valor2 * bet.odd2;

            console.log(`Resultado 1: ${result1}, Resultado 2: ${result2}`);

            // Atualiza o saldo apenas da casa cujo checkbox foi alterado
            if (casa === 'casa1') {
              if (winnerCheckbox1.checked) {
                atualizarSaldo(casa1, result1);
              } else {
                atualizarSaldo(casa1, -result1);
              }
            } else if (casa === 'casa2') {
              if (winnerCheckbox2.checked) {
                atualizarSaldo(casa2, result2);
              } else {
                atualizarSaldo(casa2, -result2);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Erro ao obter dados da aposta: ", error);
        });
    })
    .catch((error) => {
      console.error("Erro ao atualizar vencedor: ", error);
    });
}

function deleteBet(betId) {
  const userId = firebase.auth().currentUser.uid;

  // Primeiro, obtemos os dados da aposta que será excluída para atualizar os saldos das casas
  db.collection("users").doc(userId).collection("bets").doc(betId).get().then((doc) => {
    if (doc.exists) {
      const betData = doc.data();
      const casa1 = betData.casa1;
      const casa2 = betData.casa2;
      const valor1 = betData.valor1;
      const valor2 = betData.valor2;
      const odd1 = betData.odd1;
      const odd2 = betData.odd2;
      const result1 = valor1 * odd1;
      const result2 = valor2 * odd2;

      // Função para atualizar o saldo de uma casa
      const atualizarSaldo = (casa, resultado, valor) => {
        const houseRef = db.collection("users").doc(userId).collection("houses").doc(casa);
        houseRef.get().then((houseDoc) => {
          if (houseDoc.exists) {
            console.log(`Resultado para ${casa}: ${resultado}`);
            const novoSaldo = houseDoc.data().saldo - resultado + valor;
            console.log(`Novo saldo para ${casa}: ${novoSaldo}`);
            houseRef.update({ saldo: novoSaldo }).then(() => {
              console.log(`Saldo da casa ${casa} atualizado com sucesso!`);
            }).catch((error) => {
              console.error(`Erro ao atualizar saldo da casa ${casa}: `, error);
            });
          }
        }).catch((error) => {
          console.error(`Erro ao obter dados da casa ${casa}: `, error);
        });
      };

      // Verifica quais checkboxes estão marcados e atualiza os saldos das casas respectivas
      var winnerCheckbox1 = document.querySelector(`input[name="winner1-${betId}"]`);
      var winnerCheckbox2 = document.querySelector(`input[name="winner2-${betId}"]`);

      if (winnerCheckbox1 && winnerCheckbox1.checked) {
        atualizarSaldo(casa1, result1, valor1);
      }
      if (winnerCheckbox2 && winnerCheckbox2.checked) {
        atualizarSaldo(casa2, result2, valor2);
      }

      // Se a checkbox de casa1 estiver desmarcada, devolve o valor para casa1
      if (!winnerCheckbox1 || !winnerCheckbox1.checked) {
        atualizarSaldo(casa1, 0, valor1);
      }

      // Se a checkbox de casa2 estiver desmarcada, devolve o valor para casa2
      if (!winnerCheckbox2 || !winnerCheckbox2.checked) {
        atualizarSaldo(casa2, 0, valor2);
      }

      // Excluímos a aposta do Firestore
      db.collection("users").doc(userId).collection("bets").doc(betId).delete().then(() => {
        console.log("Aposta excluída com sucesso!");

        // Removemos a linha da tabela
        var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
        var rowToRemove = document.getElementById(betId);
        table.removeChild(rowToRemove);

        // Atualizamos os resultados e o PNL após excluir a aposta
        generatePieChart();
        calculateResults();
        updateTotalPNLDisplay();
      }).catch((error) => {
        console.error("Erro ao excluir aposta: ", error);
      });
    } else {
      console.error("Aposta não encontrada!");
    }
  }).catch((error) => {
    console.error("Erro ao obter dados da aposta: ", error);
  });
}

function calculateResults() {
  var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
  var rows = table.getElementsByTagName('tr');
  var totalPNL = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var casa1 = row.cells[0].textContent;
    var valor1 = parseFloat(row.cells[1].textContent.replace("R$ ", "").trim());
    var odd1 = parseFloat(row.cells[2].textContent.trim());
    var casa2 = row.cells[3].textContent;
    var valor2 = parseFloat(row.cells[4].textContent.replace("R$ ", "").trim());
    var odd2 = parseFloat(row.cells[5].textContent.trim());
    var checkboxes = row.cells[6].getElementsByTagName('input');
    var pnlCell = row.cells[11];

    if (checkboxes[0].checked && !checkboxes[1].checked) {
      var resultado1 = valor1 * odd1 - valor1;
      var resultado2 = -valor2;
      pnlCell.textContent = "R$ " + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$ " + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$ " + resultado2.toFixed(2); // Atualiza Result2
    } else if (!checkboxes[0].checked && checkboxes[1].checked) {
      var resultado1 = -valor1;
      var resultado2 = valor2 * odd2 - valor2;
      pnlCell.textContent = "R$ " + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$ " + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$ " + resultado2.toFixed(2); // Atualiza Result2
    } else if (checkboxes[0].checked && checkboxes[1].checked) {
      var resultado1 = valor1 * odd1 - valor1;
      var resultado2 = valor2 * odd2 - valor2;
      pnlCell.textContent = "R$ " + (resultado1 + resultado2).toFixed(2);
      row.cells[9].textContent = "R$ " + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$ " + resultado2.toFixed(2); // Atualiza Result2
    } else {
      var resultado1 = -valor1;
      var resultado2 = -valor2;
      pnlCell.textContent = "R$ 0.00";
      row.cells[9].textContent = "R$ " + resultado1.toFixed(2); // Atualiza Result1
      row.cells[10].textContent = "R$ " + resultado2.toFixed(2); // Atualiza Result2
    }

    var pnl = parseFloat(pnlCell.textContent.replace("R$ ", "").trim());
    if (!isNaN(pnl)) {
      totalPNL += pnl;
    }
  }

  // Atualiza a exibição do PNL total
  updateTotalPNLDisplay(totalPNL);
}

function updateStatus(id, status) {
  const userId = firebase.auth().currentUser.uid;
  db.collection("users").doc(userId).collection("bets").doc(id).update({ status: status })
    .then(() => {
      console.log("Status atualizado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro ao atualizar status: ", error);
    });
}

// Função para atualizar a exibição do PNL total
function updateTotalPNLDisplay(totalPNL) {
  document.getElementById("totalPNL").textContent = "Lucro Total: R$ " + totalPNL.toFixed(2);
}

function processCode(code) {
  var notyf = new Notyf(); // Inicializa o Notyf
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
      // Notificação de código incompleto ou mal formatado
      notyf.error("O código está incompleto ou mal formatado.");
    }
  } else {
    // Notificação de código incompleto ou mal formatado
    notyf.error("O código está incompleto ou mal formatado.");
  }
  return { valores1, valores2 }; // Retornando valores1 e valores2
}

// Função para adicionar uma aposta
function addBet() {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
  var casa1 = document.getElementById("casa1").value;
  var valor1 = parseFloat(document.getElementById("valor1").value);
  var casa2 = document.getElementById("casa2").value;
  var valor2 = parseFloat(document.getElementById("valor2").value);
  var odd1 = parseFloat(document.getElementById("odd1").value);
  var odd2 = parseFloat(document.getElementById("odd2").value);
  var partida = document.getElementById("partida").value;
  var dataHora = document.getElementById("data").value;

  var notyf = new Notyf(); // Inicializa o Notyf

  if (!isNaN(valor1) && !isNaN(valor2) && !isNaN(odd1) && !isNaN(odd2) && casa1 && casa2 && partida && dataHora) {
    var userHousesRef = db.collection("users").doc(userId).collection("houses");
    var betRef = db.collection("users").doc(userId).collection("bets");

    // Verifique se as casas existem e têm saldo suficiente
    var house1Ref = userHousesRef.doc(casa1);
    var house2Ref = userHousesRef.doc(casa2);

    house1Ref.get().then((doc1) => {
      if (doc1.exists && doc1.data().saldo >= valor1) {
        house2Ref.get().then((doc2) => {
          if (doc2.exists && doc2.data().saldo >= valor2) {
            // As casas têm saldo suficiente, prosseguir com a adição da aposta
            saldoPorCasa[casa1] = doc1.data().saldo; // Atualiza o saldo localmente
            saldoPorCasa[casa2] = doc2.data().saldo; // Atualiza o saldo localmente

            // Deduz os valores das apostas dos saldos das casas no banco de dados
            house1Ref.update({ saldo: doc1.data().saldo - valor1 });
            house2Ref.update({ saldo: doc2.data().saldo - valor2 });

            // Adiciona a aposta ao banco de dados
            betRef.add({
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
                newRow.insertCell().textContent = "R$ " + valor1.toFixed(2);
                newRow.insertCell().textContent = odd1.toFixed(2);
                newRow.insertCell().textContent = casa2;
                newRow.insertCell().textContent = "R$ " + valor2.toFixed(2);
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
                    generatePieChart();
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
                statusSelect.onchange = function () {
                  applyFadeoutAnimation(newRow, statusSelect.value);
                  updateStatus(doc.id, statusSelect.value);
                };

                loadBets();
                updateSaldoList();
                sortTableByDate("dashboard-table");

                // Limpar os campos do formulário
                document.getElementById("casa1").value = "";
                document.getElementById("valor1").value = "";
                document.getElementById("casa2").value = "";
                document.getElementById("valor2").value = "";
                document.getElementById("odd1").value = "";
                document.getElementById("odd2").value = "";
                document.getElementById("partida").value = "";
                document.getElementById("data").value = "";

                // Notificação de sucesso
                notyf.success("Aposta adicionada com sucesso!");
              })
              .catch((error) => {
                console.error("Erro ao adicionar aposta: ", error);
                // Notificação de erro
                notyf.error("Erro ao adicionar aposta: " + error.message);
              });
          } else {
            // Notificação de saldo insuficiente
            notyf.error("Saldo insuficiente na casa " + casa2 + " ou casa não encontrada.");
          }
        }).catch((error) => {
          console.error("Erro ao verificar saldo da casa " + casa2 + ": ", error);
          notyf.error("Erro ao verificar saldo da casa " + casa2 + ": " + error.message);
        });
      } else {
        // Notificação de saldo insuficiente
        notyf.error("Saldo insuficiente na casa " + casa1 + " ou casa não encontrada.");
      }
    }).catch((error) => {
      console.error("Erro ao verificar saldo da casa " + casa1 + ": ", error);
      notyf.error("Erro ao verificar saldo da casa " + casa1 + ": " + error.message);
    });
  } else {
    // Notificação de campos obrigatórios
    notyf.error("Por favor, preencha todos os campos obrigatórios com valores válidos.");
  }
}


function addBetFromCode(casa1, valor1, odd1, casa2, valor2, odd2, partida, dataHora) {
  const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado

  // Referência para o documento do usuário que contém as informações das casas
  var userHousesRef = db.collection("users").doc(userId).collection("houses");

  // Verifica se as casas existem e têm saldo suficiente
  var house1Ref = userHousesRef.doc(casa1);
  var house2Ref = userHousesRef.doc(casa2);

  house1Ref.get().then((doc1) => {
    if (doc1.exists && doc1.data().saldo >= valor1) {
      house2Ref.get().then((doc2) => {
        if (doc2.exists && doc2.data().saldo >= valor2) {
          // As casas têm saldo suficiente, prosseguir com a adição da aposta
          saldoPorCasa[casa1] = doc1.data().saldo; // Atualiza o saldo localmente
          saldoPorCasa[casa2] = doc2.data().saldo; // Atualiza o saldo localmente

          // Deduz os valores das apostas dos saldos das casas no banco de dados
          house1Ref.update({ saldo: doc1.data().saldo - valor1 });
          house2Ref.update({ saldo: doc2.data().saldo - valor2 });

          // Adiciona a aposta ao banco de dados
          db.collection("users").doc(userId).collection("bets").add({
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
              newRow.insertCell().textContent = "R$ " + valor1.toFixed(2);
              newRow.insertCell().textContent = odd1.toFixed(2);
              newRow.insertCell().textContent = casa2;
              newRow.insertCell().textContent = "R$ " + valor2.toFixed(2);
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
                  generatePieChart();
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
              statusSelect.onchange = function () {
                applyFadeoutAnimation(newRow, statusSelect.value);
                updateStatus(doc.id, statusSelect.value);
              };

              // Notificação de sucesso
              var notyf = new Notyf();
              notyf.success("Aposta adicionada com sucesso!");

              loadBets();
              updateSaldoList();
            })
            .catch((error) => {
              console.error("Erro ao adicionar aposta: ", error);
              // Notificação de erro
              var notyf = new Notyf();
              notyf.error("Erro ao adicionar aposta: " + error.message);
            });
        } else {
          var notyf = new Notyf();
          notyf.error("Saldo insuficiente na casa " + casa2 + " ou casa não encontrada.");
        }
      }).catch((error) => {
        console.error("Erro ao verificar saldo da casa " + casa2 + ": ", error);
        var notyf = new Notyf();
        notyf.error("Erro ao verificar saldo da casa " + casa2 + ": " + error.message);
      });
    } else {
      var notyf = new Notyf();
      notyf.error("Saldo insuficiente na casa " + casa1 + " ou casa não encontrada.");
    }
  }).catch((error) => {
    console.error("Erro ao verificar saldo da casa " + casa1 + ": ", error);
    var notyf = new Notyf();
    notyf.error("Erro ao verificar saldo da casa " + casa1 + ": " + error.message);
  });
}

function updateStatus(betId, newStatus) {
  const userId = firebase.auth().currentUser.uid;

  db.collection("users").doc(userId).collection("bets").doc(betId).update({
    status: newStatus
  }).then(() => {
    console.log("Status da aposta atualizado com sucesso!");
  }).catch((error) => {
    console.error("Erro ao atualizar status da aposta: ", error);
  });
  loadBets();
}

document.addEventListener("DOMContentLoaded", function () {
  updateSaldoList(); // Atualiza a lista de saldos
  loadBets(); // Recarrega a tabela após atualizar o vencedor
  filterByStatus(); // Filtrar por Status
  sortTableByDate("dashboard-table");
});

function applyFadeoutAnimation(row, status) {
  const currentFilter = document.querySelector('input[name="status-filter"]:checked').value;
  if (currentFilter !== 'todos') {
    if (status === 'resolvido') {
      row.classList.add('fadeout-right');
    } else if (status === 'pendente') {
      row.classList.add('fadeout-left');
    }
    setTimeout(() => {
      row.classList.remove('fadeout-right', 'fadeout-left');
      loadbets(); // Chame a função loadbets após a remoção da animação
    }, 500); // Duração da animação
  }
}