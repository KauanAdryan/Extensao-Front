const API_BASE_URL = 'http://localhost:3000';
const DIAS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
const HORARIOS = ['08:15', '09:15', '10:15', '11:15', '12:15'];

const gridWrapper = document.getElementById('gridWrapper');
const statusMsg = document.getElementById('statusMsg');
const userInfo = document.getElementById('userInfo');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');
const aulasWrapper = document.getElementById('aulasWrapper');

let usuarioLogado = null;

function setStatus(texto, tipo = 'info') {
  if (!statusMsg) return;
  const cores = { info: '#0f172a', success: '#15803d', error: '#b91c1c' };
  statusMsg.textContent = texto;
  statusMsg.style.color = cores[tipo] || cores.info;
}

function slugDia(d) {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function renderGrid(disponibilidade = {}) {
  if (!gridWrapper) return;
  const header = ['<th>Horário</th>', ...DIAS.map(d => `<th>${slugDia(d)}</th>`)].join('');
  const rows = HORARIOS.map(h => {
    const cells = DIAS.map(d => {
      const checked = disponibilidade?.[d]?.[h] === 'Sim' ? 'checked' : '';
      return `<td><input type="checkbox" data-dia="${d}" data-hora="${h}" ${checked}></td>`;
    }).join('');
    return `<tr><th>${h}</th>${cells}</tr>`;
  }).join('');

  gridWrapper.innerHTML = `
    <table class="disp-table">
      <thead><tr>${header}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function coletarDisponibilidade() {
  const disponibilidade = {};
  const inputs = gridWrapper.querySelectorAll('input[type="checkbox"]');
  inputs.forEach(input => {
    const dia = input.getAttribute('data-dia');
    const hora = input.getAttribute('data-hora');
    if (!disponibilidade[dia]) disponibilidade[dia] = {};
    disponibilidade[dia][hora] = input.checked ? 'Sim' : 'Não';
  });
  return disponibilidade;
}

async function carregarUsuario() {
  try {
    const raw = localStorage.getItem('usuarioLogado');
    if (!raw) throw new Error('Nenhum usuário logado encontrado.');
    const parsed = JSON.parse(raw);
    usuarioLogado = parsed;
    if (userInfo) {
      userInfo.textContent = `Professor: ${parsed.nome || '---'} (${parsed.email || '-'})`;
    }
    const resp = await fetch(`${API_BASE_URL}/usuario/${parsed.id}`);
    if (!resp.ok) throw new Error('Erro ao carregar dados do professor.');
    const usuarioServidor = await resp.json();
    renderGrid(usuarioServidor.disponibilidade || {});
    await carregarAulasProfessor(usuarioServidor.id);
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'Falha ao carregar disponibilidade.', 'error');
  }
}

async function salvar() {
  if (!usuarioLogado) {
    setStatus('Nenhum usuário logado.', 'error');
    return;
  }
  setStatus('Salvando...', 'info');
  const disponibilidade = coletarDisponibilidade();
  try {
    const resp = await fetch(`${API_BASE_URL}/usuario/${usuarioLogado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponibilidade })
    });
    if (!resp.ok) throw new Error(`Erro ao salvar: ${resp.status}`);
    setStatus('Disponibilidade atualizada com sucesso!', 'success');
  } catch (err) {
    console.error(err);
    setStatus('Não foi possível salvar. Tente novamente.', 'error');
  }
}

function resetar() {
  const checkboxes = gridWrapper.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(c => c.checked = false);
  setStatus('Todos os horários foram desmarcados.', 'info');
}

function extrairAulasDoProfessor(turmas = [], professorId) {
  const aulasPorTurma = [];
  for (const turma of turmas) {
    const horario = turma.horario || {};
    const aulas = [];
    for (const dia of DIAS) {
      const slots = horario[dia] || {};
      for (const hora of Object.keys(slots)) {
        const slot = slots[hora];
        if (slot && `${slot.professorId}` === `${professorId}`) {
          aulas.push({ hora, dia, materia: slot.materiaNome });
        }
      }
    }
    if (aulas.length) {
      aulasPorTurma.push({ turma, aulas });
    }
  }
  return aulasPorTurma;
}

function renderAulasProfessor(aulasPorTurma = []) {
  if (!aulasWrapper) return;
  if (!aulasPorTurma.length) {
    aulasWrapper.innerHTML = `<p class="notice">Nenhuma aula encontrada para você.</p>`;
    return;
  }
  aulasWrapper.innerHTML = aulasPorTurma.map(({ turma, aulas }) => {
    const linhas = aulas
      .sort((a, b) => a.hora.localeCompare(b.hora) || a.dia.localeCompare(b.dia))
      .map(a => `
        <tr>
          <td>${a.hora}</td>
          <td>${a.dia.charAt(0).toUpperCase() + a.dia.slice(1)}</td>
          <td>${a.materia}</td>
        </tr>
      `).join('');
    return `
      <div style="margin-top:12px;">
        <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">${turma.nome || 'Turma'} • ${turma.serie || ''}</div>
        <table class="disp-table">
          <thead>
            <tr>
              <th>Horário</th>
              <th>Dia</th>
              <th>Matéria</th>
            </tr>
          </thead>
          <tbody>
            ${linhas}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

async function carregarAulasProfessor(professorId) {
  try {
    const resp = await fetch(`${API_BASE_URL}/turma`);
    if (!resp.ok) throw new Error('Erro ao carregar turmas para aulas.');
    const turmas = await resp.json();
    const aulas = extrairAulasDoProfessor(turmas, professorId);
    renderAulasProfessor(aulas);
  } catch (err) {
    console.error(err);
    if (aulasWrapper) aulasWrapper.innerHTML = `<p class="notice">Não foi possível carregar suas aulas.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  btnSave?.addEventListener('click', salvar);
  btnReset?.addEventListener('click', resetar);
});
