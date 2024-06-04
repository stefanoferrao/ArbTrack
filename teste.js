// Função para atualizar o vencedor
function updateWinner(id) {
    var winnerCheckbox1 = document.querySelector(`input[name="winner1-${id}"]`);
    var winnerCheckbox2 = document.querySelector(`input[name="winner2-${id}"]`);
  
    var vencedor;
    if (winnerCheckbox1.checked && winnerCheckbox2.checked) {
      vencedor = [winnerCheckbox1.value, winnerCheckbox2.value];
    } else if (winnerCheckbox1.checked) {
      vencedor = winnerCheckbox1.value;
    } else if (winnerCheckbox2.checked) {
      vencedor = winnerCheckbox2.value;
    } else {
      vencedor = "";
    }
  
    db.collection("bets").doc(id).update({ vencedor: vencedor })
      .then(() => {
        console.log("Vencedor atualizado com sucesso!");
        loadBets(); // Recarrega a tabela após atualizar o vencedor
      })
      .catch((error) => {
        console.error("Erro ao atualizar vencedor: ", error);
      });
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // Função para atualizar o vencedor no banco de dados
  function updateWinner(betId) {
    var table = document.getElementById("dashboard-table").getElementsByTagName('tbody')[0];
    var rows = table.getElementsByTagName('tr');
    var vencedores = [];
  
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkboxes = row.cells[6].getElementsByTagName('input');
      var checkedBoxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);
      checkedBoxes.forEach(checkbox => vencedores.push(checkbox.value));
    }
  
    db.collection("bets").doc(betId).update({
      vencedor: vencedores
    })
    .then(() => {
      console.log("Vencedor atualizado com sucesso!");
      calculateResults();
    })
    .catch((error) => {
      console.error("Erro ao atualizar vencedor: ", error);
    });
  }

