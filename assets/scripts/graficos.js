const fetchUserData = async () => {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('Usuário não autenticado');
        throw new Error('Usuário não autenticado');
    }
    const userId = user.uid;
    const db = firebase.firestore();
    const betsSnapshot = await db.collection('users').doc(userId).collection('bets').get();
    const betsData = [];
    betsSnapshot.forEach(doc => {
        const data = doc.data();
        data.betId = doc.id;
        betsData.push(data);
    });
    return betsData;
};

const renderChart = async () => {
    try {
        console.log('Iniciando renderização do gráfico');
        const userData = await fetchUserData();

        // Filtrar e organizar os dados por data
        const resolvedBets = userData
            .filter(bet => bet.status === 'resolvido')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

        // Calcular o lucro acumulado
        let accumulatedProfit = 0;
        const data = resolvedBets.map((bet, index) => {
            let lucro;
            if (index === 0) {
                // Se for a primeira aposta, use o valor inicial como lucro
                lucro = bet.vencedor.includes(bet.casa1)
                    ? bet.valor1 * bet.odd1 - bet.valor1 - bet.valor2
                    : bet.valor2 * bet.odd2 - bet.valor2 - bet.valor1;
                accumulatedProfit = lucro; // Inicialize o lucro acumulado
            } else {
                lucro = bet.vencedor.includes(bet.casa1)
                    ? bet.valor1 * bet.odd1 - bet.valor1 - bet.valor2
                    : bet.valor2 * bet.odd2 - bet.valor2 - bet.valor1;
                accumulatedProfit += lucro;
            }
            return [bet.betId, accumulatedProfit];
        });

        // Renderizar o gráfico usando Highcharts
        Highcharts.chart('myChart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Lucro Acumulado'
            },
            xAxis: {
                type: 'linear', // Define o tipo do eixo como linear
                title: {
                    text: 'Número da Aposta' // Título do eixo x
                },
                tickInterval: 1 // Mostra apenas números inteiros no eixo x
            },
            yAxis: {
                title: {
                    text: 'Lucro'
                }
            },
            series: [{
                name: 'Lucro Acumulado',
                data: data.map(item => parseFloat(item[1].toFixed(2)))
            }],
            
            credits: {
                enabled: false // Desativa os créditos
            }
        });

        console.log('Gráfico renderizado com sucesso');
    } catch (error) {
        console.error('Erro ao renderizar o gráfico:', error);

    }
};

///////////////////////////////// GRÁFICO PIZZA /////////////////////////////////

// Função para buscar os dados e gerar o gráfico
function generatePieChart() {
    const userId = firebase.auth().currentUser.uid; // Obtém o UID do usuário autenticado
    console.log("Buscando dados do Firestore...");
    // Referência para os dados
    const housesRef = db.collection(`users/${userId}/houses`);

    // Array para armazenar os dados
    let data = [];

    // Buscar os dados
    housesRef.get().then((querySnapshot) => {
        console.log("Dados obtidos com sucesso.");
        querySnapshot.forEach((doc) => {
            const houseId = doc.id;
            const saldo = doc.data().saldo;

            // Adicionar os dados ao array
            data.push({ houseId, saldo });
        });

        //        console.log("Dados para o gráfico:", data); // Verificar os dados antes de chamar a função drawPieChart()

        // Gerar o gráfico de pizza
        drawPieChart(data);
    }).catch((error) => {
        console.log("Erro ao buscar os dados:", error);
    });
}


// Função para gerar o gráfico de pizza
function drawPieChart(data) {
    console.log("Gerando gráfico de pizza...");

    // Extrair os rótulos e valores
    const labels = data.map(item => item.houseId);
    const values = data.map(item => item.saldo);

    // Configurações do gráfico de pizza
    Highcharts.chart('pieChart', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Casa de Apostas'
        },
        credits: {
            enabled: false // Desativar os créditos
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                return '<b>' + this.point.name + '</b>: ' + this.point.y;
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },

        series: [{
            name: 'Porcentagem',
            colorByPoint: true,
            data: data.map(item => ({
                name: item.houseId,
                y: item.saldo
            }))
        }],
        // Adicionando o menu de gráfico
        navigation: {
            menuItemStyle: {
                fontSize: '10px' // Estilo do texto do menu
            },
            menuItemHoverStyle: {
                background: 'black' // Cor de fundo ao passar o mouse
            },
            menuStyle: {
                border: '1px solid #000', // Estilo da borda do menu
                background: '#FFFFFF' // Cor de fundo do menu
            },
            menuItems: ["viewFullscreen", "separator", "downloadJPEG", "downloadPDF", "downloadPNG", "downloadSVG"] // Opções de menu
        }
    });

    console.log("Gráfico de pizza gerado com sucesso.");
}

// Chamar a função para gerar o gráfico quando a página carregar
console.log("Página carregada. Gerando gráfico de pizza...");