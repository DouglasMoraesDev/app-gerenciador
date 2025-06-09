// public/js/criar-os.js
import { criarOrdem, getServicos, getParceiras } from './api.js';

const form       = document.getElementById('criar-os-form');
const container  = document.getElementById('itens-container');
const addBtn     = document.getElementById('add-item');

function maskBRL(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = v;
  });
}

function newItem(idx) {
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <select name="servico" required>
      <option value="">-- selecione serviço --</option>
    </select>
    <input name="valor" placeholder="R$" required />
    <button type="button" class="rmv">✕</button>
  `;
  const sel = div.querySelector('select');
  const inp = div.querySelector('input');
  div.querySelector('.rmv').onclick = () => {
    if (container.children.length > 1) div.remove();
  };
  maskBRL(inp);
  // ao mudar serviço, já pré‑põe valor
  sel.onchange = () => {
    const opt = sel.selectedOptions[0];
    if (opt && opt.dataset.valor) {
      inp.value = parseFloat(opt.dataset.valor)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
  };
  return div;
}

async function init() {
  const servicos  = await getServicos();
  const parceiros = await getParceiras();

  // popula select de parceiros
  const psel = form.querySelector('select[name="parceiroId"]');
  parceiros.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.nome;
    psel.appendChild(o);
  });

  // primeira linha de serviço
  container.appendChild(newItem(0));
  // preenche opções de serviço
  container.querySelectorAll('select[name="servico"]').forEach(sel => {
    servicos.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.dataset.valor = s.valor;
      o.textContent = s.nome;
      sel.appendChild(o);
    });
  });

  addBtn.onclick = () => {
    const idx = container.children.length;
    const row = newItem(idx);
    // popula serviços na nova linha
    servicos.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.dataset.valor = s.valor;
      o.textContent = s.nome;
      row.querySelector('select').appendChild(o);
    });
    container.appendChild(row);
  };

  form.onsubmit = async e => {
    e.preventDefault();
    // coleta placa/modelo/parceiroId
    const plate      = form.plate.value.trim();
    const model      = form.model.value.trim();
    const parceiroId = form.parceiroId.value || null;

    if (!plate || !model) {
      return alert('Informe placa e modelo do carro.');
    }

    // coleta itens
    const itens = Array.from(container.children).map(row => {
      const servicoId   = Number(row.querySelector('select[name="servico"]').value);
      // converter string "1.234,56" para número
      const valorText   = row.querySelector('input[name="valor"]').value;
      const valor       = parseFloat(valorText.replace(/\./g,'').replace(',', '.'));
      return { servicoId, valorServico: valor };
    });

    if (itens.length === 0) {
      return alert('Adicione ao menos um serviço.');
    }

    // envia ao back
    try {
      await criarOrdem({ plate, model, parceiroId, itens });
      alert('Ordem criada com sucesso!');
      form.reset();
      container.innerHTML = '';
      container.appendChild(newItem(0));
    } catch (err) {
      alert('Erro ao criar ordem: ' + err.message);
    }
  };
}

document.addEventListener('DOMContentLoaded', init);
