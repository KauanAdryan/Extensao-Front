const API_BASE_URL = "http://localhost:3000";
const ENDPOINTS = {
  professores: `${API_BASE_URL}/usuario`,
  turmas: `${API_BASE_URL}/turma`,
  materias: `${API_BASE_URL}/materia`
};

// Distribuição semanal ajustada para a matriz curricular de ADS
const CARGA_SEMANAL = [
  { materiaId: 1, nome: "Introdução à Programação", carga: 3 },
  { materiaId: 2, nome: "Programação Orientada a Objetos", carga: 2 },
  { materiaId: 3, nome: "Desenvolvimento Web", carga: 2 },
  { materiaId: 4, nome: "Desenvolvimento Back-end", carga: 2 },
  { materiaId: 5, nome: "Desenvolvimento Front-end", carga: 2 },
  { materiaId: 6, nome: "Desenvolvimento Full-stack", carga: 3 },
  { materiaId: 7, nome: "Codificação Segura", carga: 2 },
  { materiaId: 8, nome: "Desenvolvimento para Sistemas Embarcados", carga: 1 },
  { materiaId: 9, nome: "Desenvolvimento para Dispositivos Móveis", carga: 3 },
  { materiaId: 10, nome: "Engenharia de Requisitos", carga: 2 },
  { materiaId: 11, nome: "Modelagem de Dados", carga: 2 },
  { materiaId: 12, nome: "Análise Orientada a Objetos", carga: 2 },
  { materiaId: 13, nome: "UX/UI Design de Sistemas", carga: 1 },
  { materiaId: 14, nome: "Arquitetura de Software", carga: 1 },
  { materiaId: 15, nome: "Qualidade e Testes de Software", carga: 2 },
  { materiaId: 16, nome: "Engenharia de Software", carga: 2 },
  { materiaId: 17, nome: "Introdução à Computação", carga: 1 },
  { materiaId: 18, nome: "Sistemas de Gerenciamento de Banco de Dados", carga: 2 },
  { materiaId: 19, nome: "Tecnologias e Sistemas de Informação Gerencial", carga: 1 },
  { materiaId: 20, nome: "Cloud & ITOps", carga: 2 },
  { materiaId: 21, nome: "Gerenciamento de Projetos de Software", carga: 2 },
  { materiaId: 22, nome: "Tópicos Especiais em ADS", carga: 2 },
  { materiaId: 23, nome: "Legislação Aplicada à Informática", carga: 1 },
  { materiaId: 24, nome: "Extensão em ADS I", carga: 1 },
  { materiaId: 25, nome: "Extensão em ADS II", carga: 1 },
  { materiaId: 26, nome: "Extensão em ADS III", carga: 1 },
  { materiaId: 27, nome: "Extensão em ADS IV", carga: 1 },
  { materiaId: 28, nome: "Extensão em ADS V", carga: 1 },
  { materiaId: 29, nome: "Fundamentos da Pesquisa", carga: 1 },
  { materiaId: 30, nome: "Metodologia do Trabalho Científico", carga: 1 },
  { materiaId: 31, nome: "Libras", carga: 1 }
];

// Mapeia as matérias por fase/série para evitar lotar a grade com todas as disciplinas
// Fase I (limitada a 25 slots semanais)
const FASE_I = [
  "1",  // Introdução à Programação (3)
  "2",  // Programação Orientada a Objetos (2)
  "3",  // Desenvolvimento Web (2)
  "5",  // Desenvolvimento Front-end (2)
  "7",  // Codificação Segura (2)
  "9",  // Desenvolvimento para Dispositivos Móveis (3)
  "10", // Engenharia de Requisitos (2)
  "11", // Modelagem de Dados (2)
  "17", // Introdução à Computação (1)
  "18", // SGBD (2)
  "24", // Extensão em ADS I (1)
  "29", // Fundamentos da Pesquisa (1)
  "30"  // Metodologia do Trabalho Científico (1)
];
const FASE_II = ["2", "12", "13", "18", "25"];
const FASE_III = ["4", "5", "14", "15", "19", "20", "26"];

const MATERIAS_POR_SERIE = {
  "Fase I": FASE_I,
  "Fase II": FASE_II,
  "Fase III": FASE_III,
  "1º Ano": FASE_I,
  "2º Ano": FASE_II,
  "3º Ano": FASE_III
};

const LIMITE_PADRAO_MATERIAS = 10;

const DIAS = ["segunda", "terca", "quarta", "quinta", "sexta"];
const SLOTS_POR_DIA = 5;

const state = {
  professores: [],
  turmas: [],
  materias: [],
  horarios: [],
  ultimaAgenda: null
};

const UI = {
  turmaSelect: null,
  anoLetivo: null,
  observacoes: null,
  btnGerar: null,
  btnLimpar: null,
  status: null,
  tabela: null,
  descricao: null,
  anoLetivoSelecionado: null,
  ultimaAtualizacao: null,
  resumoLista: null,
  totalAulas: null
};

document.addEventListener("DOMContentLoaded", () => {
  vincularElementos();
  registrarEventos();
  inicializarTela();
});

function vincularElementos() {
  UI.turmaSelect = document.querySelector("#turmaSelect");
  UI.anoLetivo = document.querySelector("#anoLetivo");
  UI.observacoes = document.querySelector("#observacoes");
  UI.btnGerar = document.querySelector("#btnGerarHorario");
  UI.btnLimpar = document.querySelector("#btnLimparTabela");
  UI.status = document.querySelector("#statusMsg");
  UI.tabela = document.querySelector("#tabela-horario tbody");
  UI.descricao = document.querySelector("#descricaoHorarios");
  UI.anoLetivoSelecionado = document.querySelector("#anoLetivoSelecionado");
  UI.ultimaAtualizacao = document.querySelector("#ultimaAtualizacao");
  UI.resumoLista = document.querySelector("#resumo-lista");
  UI.totalAulas = document.querySelector("#totalAulas");
}

function registrarEventos() {
  UI.btnGerar?.addEventListener("click", handleGerarHorario);
  UI.btnLimpar?.addEventListener("click", handleLimpar);
}

async function inicializarTela() {
  if (UI.anoLetivo && !UI.anoLetivo.value) {
    UI.anoLetivo.value = new Date().getFullYear();
  }
  limparTabela();
  try {
    await carregarBase();
    preencherTurmas();
    exibirStatus("Selecione uma turma para gerar o horário.", "info");
  } catch (error) {
    console.error(error);
    exibirStatus(error.message, "error");
  }
}

async function carregarBase() {
  if (state.professores.length && state.turmas.length && state.materias.length) return;

  const [profRes, turmaRes, matRes] = await Promise.all([
    fetch(ENDPOINTS.professores),
    fetch(ENDPOINTS.turmas),
    fetch(ENDPOINTS.materias)
  ]);

  if (!profRes.ok || !turmaRes.ok || !matRes.ok) {
    throw new Error("Não foi possível carregar os dados do servidor.");
  }

  state.professores = await profRes.json();
  state.turmas = await turmaRes.json();
  state.materias = await matRes.json();
  state.horarios = calcularHorariosPreferenciais(state.professores);
}

function preencherTurmas() {
  if (!UI.turmaSelect) return;
  UI.turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';

  const turmasAtivas = state.turmas
    .filter((turma) => turma.status !== "Inativo")
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  for (const turma of turmasAtivas) {
    const option = document.createElement("option");
    option.value = turma.id ?? turma.nome ?? "";
    option.textContent = turma.nome && turma.serie ? `${turma.nome} • ${turma.serie}` : turma.nome || turma.serie || "Turma";
    UI.turmaSelect.appendChild(option);
  }
}

async function handleGerarHorario() {
  if (!UI.turmaSelect?.value) {
    exibirStatus("Escolha uma turma antes de gerar o horário.", "error");
    return;
  }

  const turmaSelecionada = state.turmas.find((t) => `${t.id}` === `${UI.turmaSelect.value}`);
  if (turmaSelecionada && horarioExiste(turmaSelecionada.horario)) {
    exibirStatus("Esta turma já possui horário salvo. Limpe ou edite antes de gerar novamente.", "warning");
    return;
  }

  setLoading(true);
  exibirStatus("Gerando grade anual...", "info");

  const anoLetivo = UI.anoLetivo?.value?.trim() || `${new Date().getFullYear()}`;
  const observacoes = UI.observacoes?.value?.trim() ?? "";
  const turmaNome = UI.turmaSelect.selectedOptions[0]?.textContent ?? "Turma selecionada";

  try {
    await carregarBase();
    const agenda = await gerarAgendaParaTurma(UI.turmaSelect.value);
    state.ultimaAgenda = agenda;
    const { salvoRemoto } = await salvarHorarioTurma(
      UI.turmaSelect.value,
      agenda,
      anoLetivo,
      observacoes
    );
    renderizarHorario(agenda, turmaNome, anoLetivo, observacoes);
    renderizarResumo(agenda);
    if (salvoRemoto) {
      exibirStatus("Horário gerado e salvo com sucesso!", "success");
    } else {
      exibirStatus(
        "Horário gerado. Servidor indisponível: salvo localmente; sincronize quando voltar.",
        "warning"
      );
    }
  } catch (error) {
    console.error(error);
    exibirStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function handleLimpar() {
  if (UI.turmaSelect) UI.turmaSelect.selectedIndex = 0;
  if (UI.anoLetivo) UI.anoLetivo.value = new Date().getFullYear();
  if (UI.observacoes) UI.observacoes.value = "";
  limparTabela();
  state.ultimaAgenda = null;
  exibirStatus("Tabela limpa. Pronta para gerar novamente.", "info");
}

async function gerarAgendaParaTurma(turmaId) {
  if (!state.horarios.length) {
    throw new Error("Nenhum horário disponível foi encontrado nas disponibilidades.");
  }

  const turma = state.turmas.find((t) => `${t.id}` === `${turmaId}`);
  if (!turma) throw new Error("Turma não encontrada no servidor.");

  const professores = state.professores.filter(
    (prof) => prof.cargo === "Professor" && prof.status === "Ativo"
  );
  if (!professores.length) {
    throw new Error("Nenhum professor ativo cadastrado.");
  }

  const professoresPorMateria = agruparProfessoresPorMateria(professores);
  const agenda = criarAgendaVazia();
  const ocupacao = new Set();

  const materiasSelecionadas = ordenarMateriasPorCarga(obterMateriasDaTurma(turma));
  if (!materiasSelecionadas.length) {
    throw new Error("Nenhuma matéria configurada para esta série/fase.");
  }

  for (const materiaInfo of materiasSelecionadas) {
    const candidatos = professoresPorMateria.get(`${materiaInfo.materiaId}`) || [];
    if (!candidatos.length) {
      throw new Error(
        `Nenhum professor ativo vinculado à disciplina ${materiaInfo.nome}. Ajuste as matérias dos professores.`
      );
    }

    for (let i = 0; i < materiaInfo.carga; i += 1) {
      const slot = encontrarSlotDisponivel(
        agenda,
        professoresPorMateria,
        materiaInfo.materiaId,
        ocupacao
      );
      if (!slot) {
        throw new Error(
          `Sem horário livre para ${materiaInfo.nome}. Ajuste a disponibilidade dos professores.`
        );
      }

      agenda[slot.dia][slot.hora] = {
        turmaId,
        materiaId: materiaInfo.materiaId,
        materiaNome: materiaInfo.nome,
        professorId: slot.professor.id,
        professorNome: slot.professor.nome
      };
    }
  }

  return agenda;
}

async function salvarHorarioTurma(turmaId, agenda, anoLetivo, observacoes) {
  const payload = {
    horario: agenda,
    horarioAnoLetivo: anoLetivo,
    horarioObservacoes: observacoes,
    horarioAtualizadoEm: new Date().toISOString()
  };

  let salvoRemoto = false;
  try {
    const resposta = await fetch(`${ENDPOINTS.turmas}/${turmaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao salvar`);
    }
    salvoRemoto = true;
  } catch (error) {
    console.warn("Falha ao salvar no servidor, mantendo cópia local:", error);
    try {
      localStorage.setItem(`horario_turma_${turmaId}`, JSON.stringify(payload));
    } catch (storageError) {
      console.error("Falha ao salvar backup local do horário:", storageError);
    }
  }

  const turma = state.turmas.find((t) => `${t.id}` === `${turmaId}`);
  if (turma) {
    turma.horario = agenda;
    turma.horarioAnoLetivo = anoLetivo;
    turma.horarioObservacoes = observacoes;
    turma.horarioAtualizadoEm = payload.horarioAtualizadoEm;
  }

  return { salvoRemoto };
}

function obterMateriasDaTurma(turma) {
  const idsPlanejadas = MATERIAS_POR_SERIE[turma.serie] || [];
  const lista = idsPlanejadas.length
    ? CARGA_SEMANAL.filter(({ materiaId }) => idsPlanejadas.includes(`${materiaId}`))
    : CARGA_SEMANAL.slice(0, LIMITE_PADRAO_MATERIAS);
  return lista;
}

function ordenarMateriasPorCarga(lista = CARGA_SEMANAL) {
  return [...lista].sort((a, b) => b.carga - a.carga);
}

function criarAgendaVazia() {
  const agenda = {};
  for (const dia of DIAS) {
    agenda[dia] = {};
    for (const hora of state.horarios) {
      agenda[dia][hora] = null;
    }
  }
  return agenda;
}

function horarioExiste(horario) {
  if (!horario) return false;
  return DIAS.some((dia) => {
    const slots = horario[dia] || {};
    return Object.keys(slots).length > 0;
  });
}

function agruparProfessoresPorMateria(professores) {
  const mapa = new Map();
  for (const professor of professores) {
    for (const materiaId of professor.materias ?? []) {
      const chave = `${materiaId}`;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(professor);
    }
  }
  for (const lista of mapa.values()) lista.sort((a, b) => a.nome.localeCompare(b.nome));
  return mapa;
}

function encontrarSlotDisponivel(agenda, professoresPorMateria, materiaId, ocupacao) {
  const candidatos = professoresPorMateria.get(`${materiaId}`) ?? [];

  // Balanceia a distribuição: prioriza dias com menos aulas já alocadas
  const diasOrdenados = [...DIAS].sort((a, b) => {
    const countA = Object.values(agenda[a] || {}).filter(Boolean).length;
    const countB = Object.values(agenda[b] || {}).filter(Boolean).length;
    return countA - countB;
  });

  for (const dia of diasOrdenados) {
    for (const hora of state.horarios) {
      if (agenda[dia][hora]) continue;
      const professor = candidatos.find((prof) => {
        const chave = `${prof.id}-${dia}-${hora}`;
        return prof.disponibilidade?.[dia]?.[hora] === "Sim" && !ocupacao.has(chave);
      });
      if (professor) {
        ocupacao.add(`${professor.id}-${dia}-${hora}`);
        return { dia, hora, professor };
      }
    }
  }
  return null;
}

function renderizarHorario(agenda, turmaDescricao, anoLetivo, observacoes) {
  if (!UI.tabela) return;
  UI.tabela.innerHTML = "";

  for (const hora of state.horarios) {
    const tr = document.createElement("tr");
    const cells = [`<th>${hora}</th>`];
    for (const dia of DIAS) {
      const slot = agenda[dia][hora];
      cells.push(
        slot
          ? `<td>${slot.materiaNome}<br><small>${slot.professorNome}</small></td>`
          : "<td>-</td>"
      );
    }
    tr.innerHTML = cells.join("");
    UI.tabela.appendChild(tr);
  }

  const partes = [turmaDescricao];
  if (anoLetivo) partes.push(`Ano letivo ${anoLetivo}`);
  if (observacoes) partes.push(`Obs.: ${observacoes}`);
  UI.descricao.textContent = partes.join(" • ") || "Horário gerado";
  UI.anoLetivoSelecionado.textContent = anoLetivo || "-";
  UI.ultimaAtualizacao.textContent = new Date().toLocaleString("pt-BR");
}

function renderizarResumo(agenda) {
  if (!UI.resumoLista || !UI.totalAulas) return;
  const contagem = new Map();
  let total = 0;

  for (const dia of DIAS) {
    for (const hora of state.horarios) {
      const slot = agenda[dia][hora];
      if (slot) {
        total += 1;
        contagem.set(slot.materiaNome, (contagem.get(slot.materiaNome) ?? 0) + 1);
      }
    }
  }

  UI.totalAulas.textContent = total;

  if (!total) {
    UI.resumoLista.innerHTML = "<li>Sem dados para exibir.</li>";
    return;
  }

  UI.resumoLista.innerHTML = "";
  for (const [materia, quantidade] of [...contagem.entries()].sort((a, b) => b[1] - a[1])) {
    const li = document.createElement("li");
    li.textContent = `${materia}: ${quantidade} aula(s)`;
    UI.resumoLista.appendChild(li);
  }
}

function limparTabela() {
  if (UI.tabela) {
    UI.tabela.innerHTML =
      '<tr class="placeholder"><td colspan="6">Os horários aparecerão aqui após a geração.</td></tr>';
  }
  if (UI.descricao) UI.descricao.textContent = "Nenhum horário gerado ainda.";
  if (UI.anoLetivoSelecionado) UI.anoLetivoSelecionado.textContent = "-";
  if (UI.ultimaAtualizacao) UI.ultimaAtualizacao.textContent = "-";
  if (UI.totalAulas) UI.totalAulas.textContent = "0";
  if (UI.resumoLista) UI.resumoLista.innerHTML = "<li>Sem dados para exibir.</li>";
}

function exibirStatus(mensagem, tipo = "info") {
  if (!UI.status) return;
  UI.status.textContent = mensagem;
  UI.status.className = `status ${tipo}`;
}

function setLoading(ativo) {
  if (!UI.btnGerar) return;
  UI.btnGerar.disabled = ativo;
  UI.btnGerar.innerHTML = ativo
    ? '<i class="fas fa-spinner fa-spin"></i> Gerando...'
    : '<i class="fas fa-magic"></i> Gerar horário';
}

function calcularHorariosPreferenciais(professores) {
  const frequencia = new Map();
  for (const professor of professores) {
    const disponibilidade = professor.disponibilidade ?? {};
    for (const horas of Object.values(disponibilidade)) {
      for (const [hora, status] of Object.entries(horas)) {
        if (status === "Sim") {
          frequencia.set(hora, (frequencia.get(hora) ?? 0) + 1);
        }
      }
    }
  }

  const candidatos = [...frequencia.entries()]
    .sort((a, b) => {
      if (b[1] === a[1]) return horaParaMinutos(a[0]) - horaParaMinutos(b[0]);
      return b[1] - a[1];
    })
    .map(([hora]) => hora);

  const selecionados = candidatos.slice(0, SLOTS_POR_DIA);
  const fallback = ["08:15", "09:15", "10:15", "11:15", "12:15"];
  if (!selecionados.length) return fallback;
  return selecionados.sort((a, b) => horaParaMinutos(a) - horaParaMinutos(b));
}

function horaParaMinutos(valor) {
  const [hora, minuto] = valor.split(":").map(Number);
  return (hora || 0) * 60 + (minuto || 0);
}
