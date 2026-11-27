const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const MAX_CONCURRENT_DETAILS = 10;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor da Pokédex funcionando!' });
});

function validNumber(value, fallback, minimum, maximum) {
    const number = Number.parseInt(value, 10);
    if (!Number.isInteger(number)) return fallback;
    return Math.min(Math.max(number, minimum), maximum);
}

async function fetchPokemon(nameOrId) {
    const resposta = await fetch(`${POKEAPI_URL}/pokemon/${encodeURIComponent(nameOrId)}`);

    if (resposta.status === 404) {
        return null;
    }

    if (!resposta.ok) {
        throw new Error(`PokéAPI respondeu com status ${resposta.status}`);
    }

    return resposta.json();
}

function formatPokemon(dados) {
    const types = dados.types.map((item) => item.type.name);

    return {
        id: dados.id,
        name: dados.name,
        displayName: dados.name.charAt(0).toUpperCase() + dados.name.slice(1),
        types,
        image: dados.sprites.other['official-artwork'].front_default
            || dados.sprites.front_default
            || null
    };
}

async function mapWithConcurrency(items, concurrency, callback) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const index = nextIndex++;
            results[index] = await callback(items[index]);
        }
    }

    const workerCount = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}

app.get('/api/pokemon', async (req, res) => {
    const limit = validNumber(req.query.limit, 2000, 1, 2000);
    const offset = validNumber(req.query.offset, 0, 0, 100000);

    try {
        const resposta = await fetch(
            `${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!resposta.ok) {
            throw new Error(`PokéAPI respondeu com status ${resposta.status}`);
        }

        const dados = await resposta.json();
        const pokemon = await mapWithConcurrency(
            dados.results,
            MAX_CONCURRENT_DETAILS,
            async (item) => {
                const detalhe = await fetchPokemon(item.name);
                return detalhe ? formatPokemon(detalhe) : null;
            }
        );

        res.json({
            count: dados.count,
            limit,
            offset,
            next: dados.next,
            previous: dados.previous,
            results: pokemon.filter(Boolean)
        });
    } catch (erro) {
        res.status(502).json({
            mensagem: 'Erro ao buscar lista de Pokémon',
            erro: erro.message
        });
    }
});

app.get('/api/pokemon/:name', async (req, res) => {
    try {
        const dados = await fetchPokemon(req.params.name.toLowerCase());

        if (!dados) {
            return res.status(404).json({
                mensagem: 'Pokémon não encontrado'
            });
        }

        res.json(formatPokemon(dados));
    } catch (erro) {
        res.status(502).json({
            mensagem: 'Erro ao buscar o Pokémon',
            erro: erro.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor da Pokédex rodando em http://localhost:${PORT}`);
});
