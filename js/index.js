const myBarChart = document.getElementById('myBarChart');
const myFunnelChart = document.getElementById('myFunnelChart');

let dados;
let vendedorChart;
let produtosChart;
let vendasMensaisChart;
var graphareaVendedor = document.getElementById("vendasPorVendedor").getContext("2d");
var graphareaProdutos = document.getElementById("produtosChart").getContext("2d");
var graphareaVendasMensais = document.getElementById("vendasMensais").getContext("2d");
let firstLoop = true;

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

loadJSON('vendas.json',
  function (data) {
    dados = data;
    carregarDados(dados);
  },
  function (xhr) { console.error(xhr); }
);


function carregarDados(data) {
  const vendedores = data.vendas.reduce(function (acumulador, venda) {
    if (!acumulador[venda.vendedor]) {
      acumulador[venda.vendedor] = [];
    }
    acumulador[venda.vendedor].push(venda)
    return acumulador;
  }, {})


  const vendedoresLabel = [];
  const valoresPorVendedor = [];
  Object.keys(vendedores).forEach((item) => {
    let soma = 0;

    vendedores[item].forEach(elem => {
      soma += elem.valor;
    })
    valoresPorVendedor.push(soma);
    vendedoresLabel.push(vendedores[item][0].vendedor);
  });

  criarGraficoVendedor(vendedoresLabel, valoresPorVendedor);

  const produtos = data.vendas.reduce(function (acumulador, venda) {
    if (!acumulador[venda.produto]) {
      acumulador[venda.produto] = [];
    }
    acumulador[venda.produto].push(venda)
    return acumulador;
  }, {})


  const produtosLabel = [];
  const valoresProduto = [];
  Object.keys(produtos).forEach((item) => {
    let soma = 0;

    produtos[item].forEach(elem => {
      soma += elem.valor;
    })
    valoresProduto.push(soma);
    produtosLabel.push(produtos[item][0].produto);
  });

  criarGraficoProdutos(produtosLabel, valoresProduto);

  const meses = data.vendas.reduce(function (acumulador, venda) {
    const dataVenda = new Date(venda.data);
    const mes = dataVenda.getMonth();

    if (!acumulador[mes]) {
      acumulador[mes] = [];
    }
    acumulador[mes].push(venda)
    return acumulador;
  }, {})


  const mesesLabel = [];
  const valoresMeses = [];
  Object.keys(meses).forEach((item) => {
    let soma = 0;

    meses[item].forEach(elem => {
      soma += elem.valor;
    })
    valoresMeses.push(soma);
    const d = new Date(meses[item][0].data);
    mesesLabel.push( monthNames[d.getMonth()]);
  });

  criarGraficoVendasMensais(mesesLabel, valoresMeses);


  var buttonFiltrar = document.getElementById("buttonFiltrar");
  buttonFiltrar.addEventListener("click", filtrarDados);

  if (firstLoop) {
    adicionaValoresNoSelect(produtosLabel, mesesLabel, vendedoresLabel);
    firstLoop = false;
  }
}

function filtrarDados() {
  var selectVendedor = document.getElementById("vendedoresSelect");
  var selectProdutos = document.getElementById("produtosSelect");
  var selectMeses = document.getElementById("mesesSelect");
  var textVendedor = selectVendedor.options[selectVendedor.selectedIndex].text;
  var textProduto = selectProdutos.options[selectProdutos.selectedIndex].text;
  var textMes = selectMeses.options[selectMeses.selectedIndex].text;

  vendedorChart.destroy();
  produtosChart.destroy();
  vendasMensaisChart.destroy();

  let utilizouFiltro = false;
  let dadosFiltrados = dados;
  if (textVendedor != "Selecione") {
    var filtrado = dadosFiltrados.vendas.filter(function(venda) { return venda.vendedor == textVendedor; });
    dadosFiltrados = {vendas: filtrado}
    utilizouFiltro = true;
  } 
  if (textProduto != "Selecione") {
    var filtrado = dadosFiltrados.vendas.filter(function(venda) { return venda.produto == textProduto; });
    dadosFiltrados = {vendas: filtrado}
    utilizouFiltro = true;
  } 
  if (textMes != "Selecione") {
    var filtrado = dadosFiltrados.vendas.filter(function(venda) {
      const dataVenda = new Date(venda.data);
      mes = monthNames[dataVenda.getMonth()];
      return mes == textMes; });
    dadosFiltrados = {vendas: filtrado}
    utilizouFiltro = true;
  } 

  if (!utilizouFiltro) {
    carregarDados(dados);
  } else {
    carregarDados(dadosFiltrados);
  }
}

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function criarGraficoVendedor(vendedoresLabel, valoresPorVendedor) {
  vendedorChart = new Chart(graphareaVendedor, {
    type: 'bar',
    data: {
      labels: vendedoresLabel,
      datasets: [{
        label: 'Vendas Realizadas',
        data: valoresPorVendedor,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false
        }
      }
    },
  });
}

function criarGraficoProdutos(produtosLabel, valoresProduto) {
  const graficoDoughnutData = {
    labels: produtosLabel,
    datasets: [{
      label: 'Valor vendido',
      data: valoresProduto,
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  };


  produtosChart = new Chart(graphareaProdutos, {
    type: 'doughnut',
    data: graficoDoughnutData,
  });
}

function criarGraficoVendasMensais(mesesLabel, valoresMeses) {
  vendasMensaisChart = new Chart(graphareaVendasMensais, {
    type: 'bar',
    data: {
      labels: mesesLabel,
      datasets: [{
        label: 'Vendas Realizadas',
        data: valoresMeses,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false
        }
      }
    },
  });
}

function adicionaValoresNoSelect(produtosLabel, mesesLabel, vendedoresLabel) {
  var selectProdutos = document.getElementById("produtosSelect");
  var selectMeses = document.getElementById("mesesSelect");
  var selectVendedor = document.getElementById("vendedoresSelect");

  produtosLabel.forEach(produto => {
    opt = document.createElement("option");
                opt.value = produto;
                opt.text=produto;
                selectProdutos.appendChild(opt);
  })
  
  mesesLabel.forEach(mes => {
    opt = document.createElement("option");
                opt.value = mes;
                opt.text=mes;
                selectMeses.appendChild(opt);
  })

  vendedoresLabel.forEach(vendedor => {
    opt = document.createElement("option");
                opt.value = vendedor;
                opt.text=vendedor;
                selectVendedor.appendChild(opt);
  })
}

