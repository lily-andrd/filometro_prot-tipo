import sqlite3
from datetime import datetime

DB_NAME = "filometro.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas pelo nome
    return conn

def inicializar_banco():
    conn = get_connection()
    cursor = conn.cursor()

    # Tabela 1: Cadastro e estado atual das Unidades de Saúde
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS unidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            endereco TEXT NOT NULL,
            horario TEXT NOT NULL,
            status_aberto TEXT NOT NULL,
            pessoas_atuais INTEGER DEFAULT 0,
            capacidade_maxima INTEGER DEFAULT 50,
            entradas_hoje INTEGER DEFAULT 0,
            saidas_hoje INTEGER DEFAULT 0
        )
    """)

    # Tabela 2: Histórico de movimentação (Exigido no escopo do TCC)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historico_fluxo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unidade_id INTEGER NOT NULL,
            evento TEXT NOT NULL,
            total_no_momento INTEGER NOT NULL,
            data_hora TEXT NOT NULL,
            FOREIGN KEY (unidade_id) REFERENCES unidades(id)
        )
    """)

    # Insere as unidades iniciais se o banco estiver vazio
    cursor.execute("SELECT COUNT(*) FROM unidades")
    if cursor.fetchone()[0] == 0:
        unidades_iniciais = [
            (
                "Hospital Ipiranga (UGA II - SUS)",
                "Av. Nazaré, 28 - Ipiranga, São Paulo - SP",
                "Atendimento 24 horas (Todos os dias)",
                "Aberto 24h",
                44, 60, 158, 114
            ),
            (
                "UPA Sacomã - Dr. Augusto Gomes de Mattos",
                "Estrada das Lágrimas, 1403 - Sacomã, São Paulo - SP",
                "Atendimento 24 horas (Todos os dias)",
                "Aberto 24h",
                14, 50, 62, 48
            ),
            (
                "AMA / UBS Integrada São Vicente de Paula",
                "Rua Vicente da Costa, 289 - Ipiranga, São Paulo - SP",
                "Seg a Sáb: 07h00 às 19h00",
                "Aberto agora",
                22, 45, 79, 57
            ),
            (
                "UBS Sacomã",
                "Estrada das Lágrimas, 1403 - Sacomã, São Paulo - SP",
                "Seg a Sex: 07h00 às 19h00",
                "Aberto agora",
                10, 40, 41, 31
            )
            ]
        cursor.executemany("""
            INSERT INTO unidades (nome, endereco, horario, status_aberto, pessoas_atuais, capacidade_maxima, entradas_hoje, saidas_hoje)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, unidades_iniciais)

    conn.commit()
    conn.close()

def listar_unidades():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM unidades")
    rows = cursor.fetchall()
    conn.close()

    resultado = []
    for row in rows:
        item = dict(row)
        # Regra de negócio: estima ~1.4 min de espera por pessoa na recepção
        item["tempo_estimado_min"] = max(5, round(item["pessoas_atuais"] * 1.4))
        resultado.append(item)
    return resultado

def atualizar_contagem(unidade_id, pessoas_atuais, entradas=None, saidas=None, evento="ATUALIZACAO_CAMERA"):
    conn = get_connection()
    cursor = conn.cursor()

    # Garante que não fique negativo nem ultrapasse o limite visualmente
    pessoas_atuais = max(0, pessoas_atuais)

    if entradas is not None and saidas is not None:
        cursor.execute("""
            UPDATE unidades
            SET pessoas_atuais = ?, entradas_hoje = ?, saidas_hoje = ?
            WHERE id = ?
        """, (pessoas_atuais, entradas, saidas, unidade_id))
    else:
        cursor.execute("""
            UPDATE unidades
            SET pessoas_atuais = ?
            WHERE id = ?
        """, (pessoas_atuais, unidade_id))

    # Grava no histórico de lotação com data e hora
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO historico_fluxo (unidade_id, evento, total_no_momento, data_hora)
        VALUES (?, ?, ?, ?)
    """, (unidade_id, evento, pessoas_atuais, agora))

    conn.commit()
    conn.close()