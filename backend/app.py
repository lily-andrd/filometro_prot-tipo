from flask import Flask, jsonify, request
from flask_cors import CORS
import database

app = Flask(__name__)
CORS(app)  # Libera o acesso do Front-end (HTML/JS) à API

# Cria as tabelas e popula os dados iniciais ao iniciar
database.inicializar_banco()

# ROTA 1: O Front-end chama esta rota (GET) para exibir os cards das UBSs
@app.route("/api/unidades", methods=["GET"])
def get_unidades():
    unidades = database.listar_unidades()
    return jsonify(unidades), 200

# ROTA 2: O script OpenCV (contador_pessoas) chama esta rota (POST) quando alguém entra ou sai
@app.route("/api/atualizar-fluxo", methods=["POST"])
def post_atualizar_fluxo():
    dados = request.get_json()
    
    if not dados or "unidade_id" not in dados or "pessoas_atuais" not in dados:
        return jsonify({"erro": "Envie 'unidade_id' e 'pessoas_atuais' no JSON"}), 400

    unidade_id = dados["unidade_id"]
    pessoas_atuais = int(dados["pessoas_atuais"])
    entradas = dados.get("entradas")
    saidas = dados.get("saidas")
    evento = dados.get("evento", "CONTAGEM_OPENCV")

    database.atualizar_contagem(unidade_id, pessoas_atuais, entradas, saidas, evento)
    return jsonify({"mensagem": "Fluxo atualizado e registrado no histórico com sucesso!"}), 200

# ROTA 3: Consulta do histórico de lotação (útil para mostrar o banco funcionando na banca)
@app.route("/api/historico", methods=["GET"])
def get_historico():
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM historico_fluxo ORDER BY id DESC LIMIT 20")
    registros = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(registros), 200

if __name__ == "__main__":
    print("Servidor API Filômetro rodando em http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)